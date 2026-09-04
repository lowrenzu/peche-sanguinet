import type { FactorScore } from "../types";
import { pressureTrendLabel } from "./pressure";

export function explainScore(opts: {
  total: number | null;
  factors: FactorScore[];
  waterNote?: string;
  pressureDelta12?: number | null;
  windText?: string;
  analogCount: number;
  catchRate: number | null;
  confidence: number;
}): string[] {
  const lines: string[] = [];
  if (opts.total == null) {
    lines.push("Impossible de calculer l'indice : trop de données manquantes.");
    return lines;
  }

  if (opts.total >= 76) lines.push("Conditions environnementales actuellement favorables selon le modèle V1.");
  else if (opts.total >= 61) lines.push("Conditions globalement correctes, sans régime exceptionnel.");
  else if (opts.total >= 41) lines.push("Conditions mixtes : certains facteurs aident, d'autres limitent.");
  else lines.push("Conditions peu favorables au modèle actuel.");

  const ranked = [...opts.factors].filter((f) => f.available).sort((a, b) => b.rawScore - a.rawScore);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  if (best) lines.push(`Facteur le plus porteur : ${best.label.toLowerCase()} (${best.detail}).`);
  if (worst && worst.id !== best?.id) {
    lines.push(`Facteur le plus limitant : ${worst.label.toLowerCase()} (${worst.detail}).`);
  }

  if (opts.waterNote) lines.push(opts.waterNote);
  if (opts.pressureDelta12 != null) {
    lines.push(`Pression ${pressureTrendLabel(opts.pressureDelta12)} sur 12 h.`);
  }
  if (opts.windText) lines.push(opts.windText);

  lines.push(
    `${opts.analogCount} journée${opts.analogCount > 1 ? "s" : ""} historique${opts.analogCount > 1 ? "s" : ""} à conditions météo comparables.`,
  );

  if (opts.catchRate == null) {
    lines.push(
      "Pas de statistique de capture : le journal local est insuffisant. Il s'agit de similarité météorologique, pas d'une probabilité de prendre un poisson.",
    );
  } else {
    lines.push(
      `Parmi les analogues avec captures enregistrées, ${opts.catchRate} % des journées ont au moins une prise (échantillon encore limité).`,
    );
  }

  if (opts.confidence < 60) {
    lines.push(
      `Confiance ${opts.confidence} % : le score environnemental peut être élevé ou bas, mais la prédiction reste fragile.`,
    );
  }

  return lines;
}

export function bestWindow(hourly: { time: string; ifScore: number | null }[]): {
  from: string;
  to: string;
  peak: number;
} | null {
  const scored = hourly.filter((h): h is { time: string; ifScore: number } => h.ifScore != null);
  if (scored.length < 3) return null;
  let bestStart = 0;
  let bestSum = -1;
  const w = 3;
  for (let i = 0; i <= scored.length - w; i++) {
    const sum = scored[i].ifScore + scored[i + 1].ifScore + scored[i + 2].ifScore;
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = i;
    }
  }
  const slice = scored.slice(bestStart, bestStart + w);
  return {
    from: slice[0].time,
    to: slice[slice.length - 1].time,
    peak: Math.max(...slice.map((s) => s.ifScore)),
  };
}

export interface FishingWindow {
  from: string;
  to: string;
  peak: number;
  peakTime: string;
  startIdx: number;
  endIdx: number;
  peakIdx: number;
}

export function nowHourIndex(hourly: { time: string }[], at = Date.now()): number {
  if (!hourly.length) return 0;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < hourly.length; i++) {
    const d = Math.abs(new Date(hourly[i].time).getTime() - at);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** Pics locaux — pas toute une journée au-dessus de 76. */
export function bestFishingWindows(
  hourly: { time: string; ifScore: number | null }[],
  maxWindows = 3,
): FishingWindow[] {
  const scored = hourly
    .map((h, i) => ({ i, time: h.time, ifScore: h.ifScore }))
    .filter((h): h is { i: number; time: string; ifScore: number } => h.ifScore != null);
  if (scored.length < 3) return [];

  const max = Math.max(...scored.map((s) => s.ifScore));
  const peakLocs: number[] = [];
  for (let k = 1; k < scored.length - 1; k++) {
    const p = scored[k].ifScore;
    if (p >= scored[k - 1].ifScore && p > scored[k + 1].ifScore) peakLocs.push(k);
  }
  if (!peakLocs.length) {
    const hi = scored.reduce((b, s, k) => (s.ifScore > scored[b].ifScore ? k : b), 0);
    peakLocs.push(hi);
  }

  const kept = peakLocs
    .filter((k) => scored[k].ifScore >= max - 4)
    .sort((a, b) => scored[b].ifScore - scored[a].ifScore || a - b)
    .slice(0, maxWindows)
    .sort((a, b) => a - b);

  const windows: FishingWindow[] = [];
  for (const pk of kept) {
    const peakScore = scored[pk].ifScore;
    let L = pk;
    let R = pk;
    while (
      L > 0 &&
      scored[L - 1].ifScore >= peakScore - 4 &&
      scored[L - 1].ifScore >= 61 &&
      pk - (L - 1) < 3
    ) {
      L -= 1;
    }
    while (
      R < scored.length - 1 &&
      scored[R + 1].ifScore >= peakScore - 4 &&
      scored[R + 1].ifScore >= 61 &&
      R + 1 - pk < 3
    ) {
      R += 1;
    }
    if (windows.some((w) => !(scored[R].i < w.startIdx || scored[L].i > w.endIdx))) continue;
    windows.push({
      from: scored[L].time,
      to: scored[R].time,
      peak: peakScore,
      peakTime: scored[pk].time,
      startIdx: scored[L].i,
      endIdx: scored[R].i,
      peakIdx: scored[pk].i,
    });
  }
  return windows.sort((a, b) => a.startIdx - b.startIdx);
}
