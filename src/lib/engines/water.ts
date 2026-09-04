import { WATER_CLIMATOLOGY_C } from "../lake";
import { clamp, lerp } from "../format";
import type { DataKind, WaterMeasure } from "../types";

export function climatologyAt(date: Date): number {
  const month = date.getUTCMonth();
  const next = (month + 1) % 12;
  const day = date.getUTCDate();
  const dim = new Date(Date.UTC(date.getUTCFullYear(), month + 1, 0)).getUTCDate();
  const t = (day - 1) / Math.max(1, dim - 1);
  return lerp(WATER_CLIMATOLOGY_C[month], WATER_CLIMATOLOGY_C[next], t);
}

/**
 * Modèle de lag thermique : l'eau suit l'air avec inertie, autour de la normale saisonnière.
 * Toujours étiqueté ESTIMATION — jamais présenté comme une mesure de station.
 */
export function estimateWaterTempC(opts: {
  at: Date;
  airMean5d: number | null;
  airNow: number | null;
}): { value: number; kind: DataKind; confidence: "moyenne" | "faible"; note: string } {
  const clima = climatologyAt(opts.at);
  if (opts.airMean5d == null && opts.airNow == null) {
    return {
      value: Number(clima.toFixed(1)),
      kind: "estimation",
      confidence: "faible",
      note: "Climatologie saisonnière uniquement — pas de série d'air disponible.",
    };
  }
  const air = opts.airMean5d ?? opts.airNow ?? clima;
  const pulled = clima + 0.42 * (air - clima);
  const hour = opts.at.getHours();
  const diurnal = 0.35 * Math.sin(((hour - 15) / 24) * Math.PI * 2);
  return {
    value: Number((pulled + diurnal).toFixed(1)),
    kind: "estimation",
    confidence: opts.airMean5d != null ? "moyenne" : "faible",
    note: "Température de surface estimée (climatologie Sanguinet + inertie thermique). Ce n'est pas une mesure in situ.",
  };
}

export function waterAnomaly(value: number, at: Date): number {
  return Number((value - climatologyAt(at)).toFixed(1));
}

export function applyWaterMeasure(
  estimated: { value: number; kind: DataKind; confidence: "moyenne" | "faible"; note: string },
  measure: WaterMeasure | null,
): {
  value: number;
  kind: DataKind;
  confidence: "moyenne" | "faible" | "haute";
  note: string;
  measured: boolean;
} {
  if (!measure) return { ...estimated, measured: false };
  const ageH = (Date.now() - new Date(measure.at).getTime()) / 3_600_000;
  if (ageH < 0 || Number.isNaN(ageH)) return { ...estimated, measured: false };
  if (ageH <= 12) {
    return {
      value: measure.tempC,
      kind: "mesure",
      confidence: "haute",
      note: `Mesure in situ (${measure.source}) — ${ageH < 1 ? "moins d'1 h" : `${ageH.toFixed(0)} h`}.`,
      measured: true,
    };
  }
  if (ageH <= 36) {
    const t = 1 - (ageH - 12) / 24;
    return {
      value: Number((t * measure.tempC + (1 - t) * estimated.value).toFixed(1)),
      kind: "estimation",
      confidence: "moyenne",
      note: `Estimation corrigée par une mesure de ${ageH.toFixed(0)} h — ce n'est plus une mesure actuelle.`,
      measured: false,
    };
  }
  return { ...estimated, measured: false };
}

/**
 * Plage V1 carnassiers d'eau douce tempérée : 11–18 °C optimal.
 * Les tendances lentes valent mieux qu'un choc thermique.
 */
export function scoreWater(opts: {
  tempC: number | null;
  delta6h?: number | null;
  delta24h?: number | null;
}): { score: number; detail: string; available: boolean } {
  if (opts.tempC == null) {
    return { score: 0, detail: "Donnée indisponible", available: false };
  }
  const t = opts.tempC;
  let score: number;
  if (t >= 11 && t <= 18) score = 94 - Math.abs(t - 14.5) * 1.2;
  else if (t >= 8 && t < 11) score = 70 + (t - 8) * 7;
  else if (t > 18 && t <= 22) score = 88 - (t - 18) * 6;
  else if (t >= 6 && t < 8) score = 48 + (t - 6) * 10;
  else if (t > 22 && t <= 25) score = 58 - (t - 22) * 6;
  else if (t < 6) score = clamp(18 + t * 3, 5, 40);
  else score = clamp(40 - (t - 25) * 5, 8, 40);

  const d24 = opts.delta24h;
  if (d24 != null) {
    if (Math.abs(d24) < 0.4) score += 4;
    else if (Math.abs(d24) > 2.5) score -= 8;
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    detail: `${t.toFixed(1)} °C surface — ${t >= 11 && t <= 18 ? "plage favorable au modèle V1" : "hors plage optimale V1"}`,
    available: true,
  };
}
