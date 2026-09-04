import { LAKE, sectorById } from "../lake";
import { cachedFetch } from "../cache";
import { getConfig } from "../config";
import { appendError } from "../store/jsonStore";
import { parisDateKey } from "../format";
import type { DailyClimate } from "../engines/historical";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const SOURCE = "Open-Meteo (forecast / ERA5 archive)";

const CURRENT =
  "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,weather_code";
const HOURLY =
  "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,weather_code";
const DAILY = "sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant";

export interface OpenMeteoForecast {
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset_seconds: number;
  current: Record<string, number | string>;
  hourly: Record<string, (number | null)[] | string[]>;
  daily: Record<string, (number | null)[] | string[]>;
}

export interface OpenMeteoArchive {
  daily: {
    time: string[];
    temperature_2m_mean: (number | null)[];
    pressure_msl_mean: (number | null)[];
    wind_speed_10m_mean: (number | null)[];
    wind_direction_10m_dominant: (number | null)[];
    cloud_cover_mean: (number | null)[];
  };
}

async function fetchJson<T>(url: string, timeoutMs = 18000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

async function pointQs(): Promise<{ qs: string; sectorId: string; lat: number; lon: number }> {
  const cfg = await getConfig();
  const sector = sectorById(cfg.sectorId);
  return {
    sectorId: sector.id,
    lat: sector.lat,
    lon: sector.lon,
    qs: `latitude=${sector.lat}&longitude=${sector.lon}&timezone=${encodeURIComponent(LAKE.timezone)}`,
  };
}

export async function loadForecast() {
  const p = await pointQs();
  try {
    return await cachedFetch<OpenMeteoForecast>({
      key: `forecast-${p.sectorId}`,
      source: SOURCE,
      loader: () =>
        fetchJson<OpenMeteoForecast>(
          `${FORECAST_URL}?${p.qs}&past_days=2&forecast_days=7&current=${CURRENT}&hourly=${HOURLY}&daily=${DAILY}&wind_speed_unit=kmh`,
        ),
    });
  } catch (e) {
    await appendError({
      at: new Date().toISOString(),
      source: "Open-Meteo forecast",
      message: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
}

export async function loadArchive(years = 5) {
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - years);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const p = await pointQs();
  try {
    return await cachedFetch<OpenMeteoArchive>({
      key: `archive-${p.sectorId}-${years}y`,
      source: "Open-Meteo ERA5 archive",
      ttlMinutes: 24 * 60,
      loader: () =>
        fetchJson<OpenMeteoArchive>(
          `${ARCHIVE_URL}?${p.qs}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_mean,pressure_msl_mean,wind_speed_10m_mean,wind_direction_10m_dominant,cloud_cover_mean&wind_speed_unit=kmh`,
          25000,
        ),
    });
  } catch (e) {
    await appendError({
      at: new Date().toISOString(),
      source: "Open-Meteo archive",
      message: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
}

export function hourlyIndexAt(times: string[], iso: string): number {
  const t = new Date(iso).getTime();
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < times.length; i++) {
    const d = Math.abs(new Date(times[i]).getTime() - t);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export function numAt(arr: (number | null)[] | undefined, i: number): number | null {
  if (!arr || i < 0 || i >= arr.length) return null;
  const v = arr[i];
  return v == null || Number.isNaN(v) ? null : v;
}

export function hoursAgoIndex(times: string[], fromIso: string, hours: number): number {
  const target = new Date(fromIso).getTime() - hours * 3600_000;
  return hourlyIndexAt(times, new Date(target).toISOString());
}

export function archiveToClimate(archive: OpenMeteoArchive): DailyClimate[] {
  const t = archive.daily.time;
  const out: DailyClimate[] = [];
  for (let i = 0; i < t.length; i++) {
    const p = archive.daily.pressure_msl_mean[i];
    const prev = i > 0 ? archive.daily.pressure_msl_mean[i - 1] : null;
    out.push({
      date: t[i],
      airTempC: archive.daily.temperature_2m_mean[i],
      pressureHpa: p,
      pressureDelta: p != null && prev != null ? Number((p - prev).toFixed(2)) : null,
      windKmh: archive.daily.wind_speed_10m_mean[i],
      windDirDeg: archive.daily.wind_direction_10m_dominant[i],
      cloudPct: archive.daily.cloud_cover_mean[i],
    });
  }
  return out;
}

export function mean(values: (number | null)[]): number | null {
  const xs = values.filter((v): v is number => v != null && !Number.isNaN(v));
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function todayKey(): string {
  return parisDateKey(new Date());
}
