import type { AnalogDay, CatchRecord } from "../types";

export interface DailyClimate {
  date: string;
  airTempC: number | null;
  pressureHpa: number | null;
  pressureDelta: number | null;
  windKmh: number | null;
  windDirDeg: number | null;
  cloudPct: number | null;
}

function n(v: number | null, min: number, max: number): number | null {
  if (v == null || Number.isNaN(v)) return null;
  return (v - min) / (max - min);
}

function circ(deg: number | null): { s: number; c: number } | null {
  if (deg == null) return null;
  const r = (deg * Math.PI) / 180;
  return { s: Math.sin(r), c: Math.cos(r) };
}

function doy(date: string): number {
  const d = new Date(date + "T12:00:00Z");
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return (d.getTime() - start) / 86400000;
}

export function analogDistance(a: DailyClimate, b: DailyClimate): number {
  const parts: number[] = [];
  const push = (x: number | null, y: number | null, w: number) => {
    if (x == null || y == null) return;
    parts.push(w * (x - y) ** 2);
  };
  push(n(a.airTempC, -5, 40), n(b.airTempC, -5, 40), 1.2);
  push(n(a.pressureHpa, 980, 1040), n(b.pressureHpa, 980, 1040), 1);
  push(n(a.pressureDelta, -15, 15), n(b.pressureDelta, -15, 15), 1.1);
  push(n(a.windKmh, 0, 50), n(b.windKmh, 0, 50), 0.9);
  push(n(a.cloudPct, 0, 100), n(b.cloudPct, 0, 100), 0.8);
  const wa = circ(a.windDirDeg);
  const wb = circ(b.windDirDeg);
  if (wa && wb) {
    parts.push(0.5 * ((wa.s - wb.s) ** 2 + (wa.c - wb.c) ** 2));
  }
  const da = doy(a.date);
  const db = doy(b.date);
  const angA = (da / 365) * Math.PI * 2;
  const angB = (db / 365) * Math.PI * 2;
  parts.push(0.7 * ((Math.sin(angA) - Math.sin(angB)) ** 2 + (Math.cos(angA) - Math.cos(angB)) ** 2));
  if (!parts.length) return 1;
  return Math.sqrt(parts.reduce((s, x) => s + x, 0) / parts.length);
}

export function findAnalogs(
  current: DailyClimate,
  archive: DailyClimate[],
  catches: CatchRecord[],
  limit = 12,
  threshold = 0.28,
): { analogs: AnalogDay[]; similarCount: number; meanDistance: number | null } {
  const scored = archive
    .filter((d) => d.date !== current.date)
    .map((d) => ({ d, dist: analogDistance(current, d) }))
    .sort((a, b) => a.dist - b.dist);

  const similar = scored.filter((x) => x.dist <= threshold);
  const top = (similar.length ? similar : scored.slice(0, 5)).slice(0, limit);

  const analogs: AnalogDay[] = top.map(({ d, dist }) => ({
    date: d.date,
    distance: Number(dist.toFixed(3)),
    airTempC: d.airTempC,
    pressureHpa: d.pressureHpa,
    windKmh: d.windKmh,
    cloudPct: d.cloudPct,
    catchesThatDay: catches.filter((c) => c.date === d.date).length,
  }));

  const meanDistance =
    similar.length > 0
      ? similar.slice(0, 20).reduce((s, x) => s + x.dist, 0) / Math.min(20, similar.length)
      : null;

  return { analogs, similarCount: similar.length, meanDistance };
}

export function historicalFactor(opts: {
  similarCount: number;
  meanDistance: number | null;
  archiveDays: number;
}): { score: number | null; detail: string } {
  if (opts.archiveDays < 14) {
    return { score: null, detail: "Historique insuffisant pour le matching." };
  }
  if (opts.similarCount === 0 || opts.meanDistance == null) {
    return {
      score: 42,
      detail: "Peu d'analogues météo proches — situation atypique pour le secteur.",
    };
  }
  const closeness = 1 - Math.min(1, opts.meanDistance / 0.28);
  const volume = Math.min(1, opts.similarCount / 25);
  const score = Math.round(45 + 40 * closeness + 15 * volume);
  return {
    score,
    detail: `${opts.similarCount} journées météo similaires (distance moyenne ${opts.meanDistance.toFixed(2)}). Similarité météorologique uniquement.`,
  };
}

export function catchRateOnAnalogs(analogs: AnalogDay[]): {
  daysWithCatches: number;
  rate: number | null;
} {
  const withData = analogs.filter((a) => a.catchesThatDay > 0);
  if (withData.length < 5) return { daysWithCatches: withData.length, rate: null };
  return {
    daysWithCatches: withData.length,
    rate: Math.round((withData.length / analogs.length) * 100),
  };
}
