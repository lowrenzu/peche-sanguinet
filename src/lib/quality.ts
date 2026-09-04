import type { QualityLevel } from "./types";
import { minutesAgo } from "./format";

export function freshnessQuality(fetchedAt: string | null, stale: boolean): QualityLevel {
  if (!fetchedAt) return 1;
  const m = minutesAgo(fetchedAt) ?? 9999;
  if (stale || m > 180) return 2;
  if (m > 60) return 3;
  if (m > 25) return 4;
  return 5;
}

export function waterQuality(kind: "mesure" | "estimation", hasRecentMeasure: boolean): QualityLevel {
  if (kind === "mesure" && hasRecentMeasure) return 5;
  if (kind === "mesure") return 4;
  return 3;
}

export function historicalQuality(analogCount: number, archiveDays: number): QualityLevel {
  if (archiveDays < 30) return 2;
  if (analogCount >= 20 && archiveDays >= 365) return 5;
  if (analogCount >= 8) return 4;
  if (analogCount >= 3) return 3;
  return 2;
}

export function combineConfidence(parts: {
  weatherFresh: QualityLevel;
  water: QualityLevel;
  historical: QualityLevel;
  completeness: number;
}): number {
  const q = (parts.weatherFresh + parts.water + parts.historical) / 15;
  const complete = Math.max(0, Math.min(1, parts.completeness));
  return Math.round(100 * (0.55 * q + 0.45 * complete));
}
