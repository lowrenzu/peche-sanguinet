import { clamp } from "../format";

export interface PressureSeries {
  current: number | null;
  h3: number | null;
  h6: number | null;
  h12: number | null;
  h24: number | null;
}

export function pressureDeltas(s: PressureSeries) {
  const d = (a: number | null, b: number | null) =>
    a != null && b != null ? Number((a - b).toFixed(2)) : null;
  return {
    d3: d(s.current, s.h3),
    d6: d(s.current, s.h6),
    d12: d(s.current, s.h12),
    d24: d(s.current, s.h24),
  };
}

export function pressureTrendLabel(d12: number | null): string {
  if (d12 === null) return "tendance inconnue";
  if (d12 <= -4) return "chute marquée";
  if (d12 <= -1) return "en baisse";
  if (d12 < 1) return "stable";
  if (d12 < 4) return "en hausse";
  return "hausse marquée";
}

/**
 * Privilégie les variations, pas une valeur isolée.
 * Une baisse progressive 1–4 hPa / 12 h est le régime le plus favorable du modèle V1.
 */
export function scorePressure(s: PressureSeries): {
  score: number;
  detail: string;
  available: boolean;
} {
  if (s.current == null) {
    return { score: 0, detail: "Donnée indisponible", available: false };
  }

  const { d12, d24 } = pressureDeltas(s);
  const delta = d12 ?? d24;
  if (delta == null) {
    const abs = s.current;
    const absScore = abs >= 1005 && abs <= 1022 ? 62 : abs < 995 || abs > 1035 ? 40 : 52;
    return {
      score: absScore,
      detail: `${abs.toFixed(0)} hPa — variation indisponible, score sur valeur seule (confiance réduite)`,
      available: true,
    };
  }

  let trendScore: number;
  if (delta <= -6) trendScore = 48;
  else if (delta <= -4) trendScore = 70;
  else if (delta <= -1) trendScore = 92;
  else if (delta < 1) trendScore = 64;
  else if (delta < 3) trendScore = 58;
  else if (delta < 6) trendScore = 46;
  else trendScore = 38;

  let absAdj = 0;
  if (s.current < 995 || s.current > 1038) absAdj = -12;
  else if (s.current >= 1004 && s.current <= 1020) absAdj = 4;

  const speed = d12 != null && s.h3 != null && s.current != null
    ? Math.abs(s.current - s.h3) * 4
    : 0;
  const shock = speed > 6 ? -10 : 0;

  const score = clamp(Math.round(trendScore + absAdj + shock), 0, 100);
  const sign = delta > 0 ? "+" : "";
  return {
    score,
    detail: `${s.current.toFixed(0)} hPa, ${sign}${delta.toFixed(1)} hPa / 12h (${pressureTrendLabel(d12)})`,
    available: true,
  };
}
