import { LAKE, sectorById } from "../lake";
import { getConfig } from "../config";
import { listCatches } from "../store/catches";
import { appendScore, latestWater } from "../store/records";
import {
  archiveToClimate,
  hoursAgoIndex,
  loadArchive,
  loadForecast,
  mean,
  numAt,
  todayKey,
  type OpenMeteoForecast,
} from "../providers/openMeteo";
import { applyWaterMeasure, estimateWaterTempC, waterAnomaly } from "../engines/water";
import { computeFrenzy, levelFromScore, speciesScores } from "../engines/fishing";
import { analyzeCatches, speciesWithLocalStats } from "../engines/stats";
import { findAnalogs, historicalFactor, catchRateOnAnalogs } from "../engines/historical";
import { pressureDeltas, type PressureSeries } from "../engines/pressure";
import { explainScore, bestWindow } from "../engines/explain";
import { buildAlerts } from "../engines/alerts";
import { combineConfidence, freshnessQuality, historicalQuality, waterQuality } from "../quality";
import { cardinalFromDeg, hourInParis, minutesAgo } from "../format";
import { toCardinal } from "../engines/wind";
import type { DailyClimate } from "../engines/historical";
import type { HourlyPoint } from "../types";

function seriesAt(fc: OpenMeteoForecast, iso: string, offsetHours = 0): {
  i: number;
  air: number | null;
  pressure: number | null;
  wind: number | null;
  gust: number | null;
  dir: number | null;
  cloud: number | null;
  precip: number | null;
  humidity: number | null;
  visibility: number | null;
  apparent: number | null;
} {
  const times = fc.hourly.time as string[];
  const target = new Date(new Date(iso).getTime() + offsetHours * 3600_000).toISOString();
  let i = 0;
  let best = Infinity;
  const t = new Date(target).getTime();
  for (let k = 0; k < times.length; k++) {
    const d = Math.abs(new Date(times[k]).getTime() - t);
    if (d < best) {
      best = d;
      i = k;
    }
  }
  return {
    i,
    air: numAt(fc.hourly.temperature_2m as (number | null)[], i),
    pressure: numAt(fc.hourly.pressure_msl as (number | null)[], i),
    wind: numAt(fc.hourly.wind_speed_10m as (number | null)[], i),
    gust: numAt(fc.hourly.wind_gusts_10m as (number | null)[], i),
    dir: numAt(fc.hourly.wind_direction_10m as (number | null)[], i),
    cloud: numAt(fc.hourly.cloud_cover as (number | null)[], i),
    precip: numAt(fc.hourly.precipitation as (number | null)[], i),
    humidity: numAt(fc.hourly.relative_humidity_2m as (number | null)[], i),
    visibility: numAt(fc.hourly.visibility as (number | null)[], i),
    apparent: numAt(fc.hourly.apparent_temperature as (number | null)[], i),
  };
}

function pressureSeries(fc: OpenMeteoForecast, nowIso: string): PressureSeries {
  const times = fc.hourly.time as string[];
  const cur = seriesAt(fc, nowIso);
  return {
    current: cur.pressure,
    h3: numAt(fc.hourly.pressure_msl as (number | null)[], hoursAgoIndex(times, nowIso, 3)),
    h6: numAt(fc.hourly.pressure_msl as (number | null)[], hoursAgoIndex(times, nowIso, 6)),
    h12: numAt(fc.hourly.pressure_msl as (number | null)[], hoursAgoIndex(times, nowIso, 12)),
    h24: numAt(fc.hourly.pressure_msl as (number | null)[], hoursAgoIndex(times, nowIso, 24)),
  };
}

function waterAt(fc: OpenMeteoForecast, iso: string) {
  const times = fc.hourly.time as string[];
  const i = seriesAt(fc, iso).i;
  const airNow = numAt(fc.hourly.temperature_2m as (number | null)[], i);
  const from = Math.max(0, i - 5 * 24);
  const slice = (fc.hourly.temperature_2m as (number | null)[]).slice(from, i + 1);
  const airMean5d = mean(slice);
  return estimateWaterTempC({ at: new Date(iso), airMean5d, airNow });
}

export async function buildSnapshot() {
  const config = await getConfig();
  const sector = sectorById(config.sectorId);
  const nowIso = new Date().toISOString();
  let forecastPack;
  let archivePack;
  let forecastError: string | null = null;
  let archiveError: string | null = null;

  try {
    forecastPack = await loadForecast();
  } catch (e) {
    forecastError = e instanceof Error ? e.message : String(e);
  }
  try {
    archivePack = await loadArchive(5);
  } catch (e) {
    archiveError = e instanceof Error ? e.message : String(e);
  }

  if (!forecastPack) {
    return {
      ok: false as const,
      error: forecastError ?? "Donnée indisponible",
      archiveError,
      lake: LAKE,
      sector,
      fetchedAt: null as string | null,
    };
  }

  const fc = forecastPack.data;
  const now = seriesAt(fc, nowIso);
  const currentIso =
    typeof fc.current.time === "string" ? fc.current.time : (fc.hourly.time as string[])[now.i];

  const pressure = pressureSeries(fc, currentIso);
  const deltas = pressureDeltas(pressure);

  const waterEst = waterAt(fc, currentIso);
  const measure = await latestWater();
  const waterNow = applyWaterMeasure(waterEst, measure);
  const water6 = waterAt(fc, new Date(new Date(currentIso).getTime() - 6 * 3600_000).toISOString());
  const water12 = waterAt(fc, new Date(new Date(currentIso).getTime() - 12 * 3600_000).toISOString());
  const water24 = waterAt(fc, new Date(new Date(currentIso).getTime() - 24 * 3600_000).toISOString());
  const water72 = waterAt(fc, new Date(new Date(currentIso).getTime() - 72 * 3600_000).toISOString());

  const catches = await listCatches();
  let analogs: ReturnType<typeof findAnalogs> = { analogs: [], similarCount: 0, meanDistance: null };
  let hist = { score: null as number | null, detail: "Historique indisponible." };
  let archiveDays = 0;

  if (archivePack) {
    const climate = archiveToClimate(archivePack.data);
    archiveDays = climate.length;
    const currentDay: DailyClimate = {
      date: todayKey(),
      airTempC: now.air,
      pressureHpa: now.pressure,
      pressureDelta: deltas.d24,
      windKmh: now.wind,
      windDirDeg: now.dir,
      cloudPct: now.cloud,
    };
    analogs = findAnalogs(currentDay, climate, catches);
    hist = historicalFactor({
      similarCount: analogs.similarCount,
      meanDistance: analogs.meanDistance,
      archiveDays,
    });
  } else if (archiveError) {
    hist = { score: null, detail: "Archive météo indisponible — matching historique non calculé." };
  }

  const hour = hourInParis(currentIso);
  const frenzy = computeFrenzy({
    waterTempC: waterNow.value,
    waterDelta6h: Number((waterNow.value - water6.value).toFixed(2)),
    waterDelta24h: Number((waterNow.value - water24.value).toFixed(2)),
    pressure,
    windKmh: now.wind,
    gustKmh: now.gust,
    cloudPct: now.cloud,
    precipMm: now.precip,
    hour,
    historicalScore: hist.score,
    historicalDetail: hist.detail,
    weights: config.weights,
  });

  const times = fc.hourly.time as string[];
  const hourly: HourlyPoint[] = times.map((time, i) => {
    const air = numAt(fc.hourly.temperature_2m as (number | null)[], i);
    const w = estimateWaterTempC({
      at: new Date(time),
      airMean5d: mean((fc.hourly.temperature_2m as (number | null)[]).slice(Math.max(0, i - 120), i + 1)),
      airNow: air,
    });
    const p = numAt(fc.hourly.pressure_msl as (number | null)[], i);
    const i12 = hoursAgoIndex(times, time, 12);
    const p12 = numAt(fc.hourly.pressure_msl as (number | null)[], i12);
    const i24 = hoursAgoIndex(times, time, 24);
    const p24 = numAt(fc.hourly.pressure_msl as (number | null)[], i24);
    const wind = numAt(fc.hourly.wind_speed_10m as (number | null)[], i);
    const gust = numAt(fc.hourly.wind_gusts_10m as (number | null)[], i);
    const cloud = numAt(fc.hourly.cloud_cover as (number | null)[], i);
    const precip = numAt(fc.hourly.precipitation as (number | null)[], i);
    const r = computeFrenzy({
      waterTempC: w.value,
      waterDelta24h: null,
      pressure: { current: p, h3: null, h6: null, h12: p12, h24: p24 },
      windKmh: wind,
      gustKmh: gust,
      cloudPct: cloud,
      precipMm: precip,
      hour: hourInParis(time),
      historicalScore: hist.score,
      historicalDetail: hist.detail,
      weights: config.weights,
    });
    return {
      time,
      ifScore: r.total,
      airTempC: air,
      waterTempC: w.value,
      pressureHpa: p,
      windKmh: wind,
      windDirDeg: numAt(fc.hourly.wind_direction_10m as (number | null)[], i),
      cloudPct: cloud,
      precipMm: precip,
    };
  });

  const fromNow = hourly.filter((h) => new Date(h.time).getTime() >= Date.now() - 30 * 60_000);
  const next24 = fromNow.filter((h) => new Date(h.time).getTime() <= Date.now() + 24 * 3600_000);
  const next72 = fromNow.filter((h) => new Date(h.time).getTime() <= Date.now() + 72 * 3600_000);
  const window = bestWindow(next24);

  const catchRate = catchRateOnAnalogs(analogs.analogs);
  const completeness =
    [now.air, now.pressure, now.wind, now.cloud, waterNow.value, hist.score].filter((v) => v != null).length / 6;

  const confidence = combineConfidence({
    weatherFresh: freshnessQuality(forecastPack.fetchedAt, forecastPack.stale),
    water: waterQuality(waterNow.kind === "mesure" ? "mesure" : "estimation", waterNow.measured),
    historical: historicalQuality(analogs.similarCount, archiveDays),
    completeness,
  });

  const species = speciesWithLocalStats(
    speciesScores(frenzy.total, {
      water: waterNow.value,
      cloud: now.cloud,
      hour,
      wind: now.wind,
    }),
    catches,
    hour,
  );
  const localStats = analyzeCatches(catches);

  const why = explainScore({
    total: frenzy.total,
    factors: frenzy.factors,
    waterNote: waterNow.note,
    pressureDelta12: deltas.d12,
    windText:
      now.wind != null && now.dir != null
        ? `Vent ${toCardinal(now.dir)} ${Math.round(now.wind)} km/h — les rives sous le vent (côte battue) sont les plus exposées.`
        : undefined,
    analogCount: analogs.similarCount,
    catchRate: catchRate.rate,
    confidence,
  });

  const plus6 = seriesAt(fc, currentIso, 6);
  const alerts = buildAlerts({
    ifNow: frenzy.total,
    confidence,
    window,
    pressure,
    windNow: now.wind,
    windPlus6: plus6.wind,
    waterDelta24: Number((waterNow.value - water24.value).toFixed(2)),
  });

  const dailyTimes = fc.daily.time as string[];
  let todayIdx = dailyTimes.findIndex((d) => d === todayKey());
  if (todayIdx < 0) todayIdx = Math.min(2, Math.max(0, dailyTimes.length - 1));
  const sunrise = (fc.daily.sunrise as string[])?.[todayIdx] ?? null;
  const sunset = (fc.daily.sunset as string[])?.[todayIdx] ?? null;

  const daily = (fc.daily.time as string[]).map((date, i) => {
    const dayHours = hourly.filter((h) => h.time.slice(0, 10) === date && h.ifScore != null);
    const ifAvg = dayHours.length
      ? Math.round(dayHours.reduce((a, h) => a + (h.ifScore ?? 0), 0) / dayHours.length)
      : null;
    return {
      date,
      tMax: numAt(fc.daily.temperature_2m_max as (number | null)[], i),
      tMin: numAt(fc.daily.temperature_2m_min as (number | null)[], i),
      rain: numAt(fc.daily.precipitation_sum as (number | null)[], i),
      windMax: numAt(fc.daily.wind_speed_10m_max as (number | null)[], i),
      windDir: numAt(fc.daily.wind_direction_10m_dominant as (number | null)[], i),
      sunrise: (fc.daily.sunrise as string[])[i] ?? null,
      sunset: (fc.daily.sunset as string[])[i] ?? null,
      ifScore: ifAvg,
    };
  });

  if (frenzy.total != null) {
    const { listScores } = await import("../store/records");
    const prev = (await listScores())[0];
    const age = prev ? Date.now() - new Date(prev.at).getTime() : Infinity;
    if (age > 15 * 60_000) {
      void appendScore({
        at: new Date().toISOString(),
        score: frenzy.total,
        confidence,
        sectorId: sector.id,
      });
    }
  }

  const missing: string[] = [];
  if (now.air == null) missing.push("température air");
  if (now.pressure == null) missing.push("pression");
  if (now.wind == null) missing.push("vent");
  if (now.cloud == null) missing.push("nébulosité");
  if (!waterNow.measured) missing.push("mesure d'eau in situ");
  if (hist.score == null) missing.push("matching historique");

  return {
    ok: true as const,
    lake: LAKE,
    sector,
    source: {
      weather: forecastPack.source,
      archive: archivePack?.source ?? null,
      mixed: false,
      stale: forecastPack.stale,
      fetchedAt: forecastPack.fetchedAt,
      archiveFetchedAt: archivePack?.fetchedAt ?? null,
      archiveError,
      minutesAgo: minutesAgo(forecastPack.fetchedAt),
    },
    current: {
      time: currentIso,
      airTempC: typeof fc.current.temperature_2m === "number" ? fc.current.temperature_2m : now.air,
      apparentC:
        typeof fc.current.apparent_temperature === "number" ? fc.current.apparent_temperature : now.apparent,
      humidity:
        typeof fc.current.relative_humidity_2m === "number" ? fc.current.relative_humidity_2m : now.humidity,
      pressureHpa: typeof fc.current.pressure_msl === "number" ? fc.current.pressure_msl : now.pressure,
      pressureDeltas: deltas,
      windKmh: typeof fc.current.wind_speed_10m === "number" ? fc.current.wind_speed_10m : now.wind,
      windGustKmh: typeof fc.current.wind_gusts_10m === "number" ? fc.current.wind_gusts_10m : now.gust,
      windDirDeg:
        typeof fc.current.wind_direction_10m === "number" ? fc.current.wind_direction_10m : now.dir,
      windCardinal: cardinalFromDeg(
        typeof fc.current.wind_direction_10m === "number" ? fc.current.wind_direction_10m : now.dir,
      ),
      cloudPct: typeof fc.current.cloud_cover === "number" ? fc.current.cloud_cover : now.cloud,
      precipMm: typeof fc.current.precipitation === "number" ? fc.current.precipitation : now.precip,
      visibilityM: typeof fc.current.visibility === "number" ? fc.current.visibility : now.visibility,
      sunrise,
      sunset,
    },
    water: {
      tempC: waterNow.value,
      kind: waterNow.kind,
      confidence: waterNow.confidence,
      note: waterNow.note,
      measured: waterNow.measured,
      anomaly: waterAnomaly(waterNow.value, new Date(currentIso)),
      delta6h: Number((waterNow.value - water6.value).toFixed(2)),
      delta12h: Number((waterNow.value - water12.value).toFixed(2)),
      delta24h: Number((waterNow.value - water24.value).toFixed(2)),
      delta72h: Number((waterNow.value - water72.value).toFixed(2)),
    },
    if: {
      score: frenzy.total,
      level: frenzy.total != null ? levelFromScore(frenzy.total, config.levels) : null,
      factors: frenzy.factors,
      weights: frenzy.usedWeights,
      configuredWeights: config.weights,
      confidence,
      why,
    },
    species,
    speciesDisclaimer: species.some((s) => s.calibrated)
      ? "Certaines espèces sont calibrées sur votre journal local. Les autres restent indicatives V1."
      : "Modèles par espèce indicatifs V1 — non calibrés sur captures Sanguinet.",
    window,
    alerts,
    analogs: analogs.analogs,
    analogCount: analogs.similarCount,
    catchRateOnAnalogs: catchRate,
    localStats,
    missing,
    hourly: next72,
    hourlyAll: hourly,
    daily,
    config,
  };
}

export type Snapshot = Awaited<ReturnType<typeof buildSnapshot>>;
export type SnapshotOk = Extract<Snapshot, { ok: true }>;
