import type {
  FactorScore,
  FrenzyLevel,
  LevelThresholds,
  ModelWeights,
  SpeciesId,
} from "../types";
import { clamp } from "../format";
import { scoreWater } from "./water";
import { scorePressure, type PressureSeries } from "./pressure";
import { scoreWind } from "./wind";
import { scoreCloud } from "./cloud";

export function levelFromScore(score: number, levels: LevelThresholds): FrenzyLevel {
  if (score >= levels.exceptionnel) return "EXCEPTIONNEL";
  if (score >= levels.tresBon) return "TRES_BON";
  if (score >= levels.bon) return "BON";
  if (score >= levels.moyen) return "MOYEN";
  if (score >= levels.faible) return "FAIBLE";
  return "TRES_MAUVAIS";
}

export function normalizeWeights(w: ModelWeights, available: Record<keyof ModelWeights, boolean>): ModelWeights {
  const keys = Object.keys(w) as (keyof ModelWeights)[];
  const raw: ModelWeights = { ...w };
  for (const k of keys) {
    if (!available[k]) raw[k] = 0;
  }
  const sum = keys.reduce((a, k) => a + raw[k], 0);
  if (sum <= 0) return { water: 0, pressure: 0, wind: 0, cloud: 0, historical: 0 };
  const out = { ...raw };
  for (const k of keys) out[k] = raw[k] / sum;
  return out;
}

export interface EngineInput {
  waterTempC: number | null;
  waterDelta6h?: number | null;
  waterDelta24h?: number | null;
  pressure: PressureSeries;
  windKmh: number | null;
  gustKmh?: number | null;
  cloudPct: number | null;
  precipMm?: number | null;
  hour?: number | null;
  historicalScore: number | null;
  historicalDetail: string;
  weights: ModelWeights;
}

export function computeFrenzy(input: EngineInput): {
  total: number | null;
  factors: FactorScore[];
  usedWeights: ModelWeights;
} {
  const water = scoreWater({
    tempC: input.waterTempC,
    delta6h: input.waterDelta6h,
    delta24h: input.waterDelta24h,
  });
  const pressure = scorePressure(input.pressure);
  const wind = scoreWind({ speedKmh: input.windKmh, gustKmh: input.gustKmh });
  const cloud = scoreCloud({
    cloudPct: input.cloudPct,
    hour: input.hour,
    precipMm: input.precipMm,
  });
  const historicalAvailable = input.historicalScore != null;
  const historical = {
    score: input.historicalScore ?? 0,
    detail: input.historicalDetail,
    available: historicalAvailable,
  };

  const available = {
    water: water.available,
    pressure: pressure.available,
    wind: wind.available,
    cloud: cloud.available,
    historical: historical.available,
  };

  const used = normalizeWeights(input.weights, available);
  const parts: { id: keyof ModelWeights; label: string; result: typeof water }[] = [
    { id: "water", label: "Température eau", result: water },
    { id: "pressure", label: "Pression", result: pressure },
    { id: "wind", label: "Vent", result: wind },
    { id: "cloud", label: "Nébulosité", result: cloud },
    { id: "historical", label: "Historique", result: historical },
  ];

  const factors: FactorScore[] = parts.map((p) => {
    const maxPoints = Math.round(used[p.id] * 100);
    const points = p.result.available ? Math.round((p.result.score / 100) * maxPoints) : 0;
    return {
      id: p.id,
      label: p.label,
      points,
      maxPoints,
      rawScore: p.result.score,
      available: p.result.available,
      detail: p.result.detail,
    };
  });

  const any = factors.some((f) => f.available);
  const total = any ? clamp(factors.reduce((a, f) => a + f.points, 0), 0, 100) : null;

  return { total, factors, usedWeights: used };
}

/** Ajustements indicatifs V1 — non calibrés sur captures locales. */
export const SPECIES_MODIFIERS: Record<
  SpeciesId,
  { label: string; shift: (ctx: { water: number | null; cloud: number | null; hour: number | null; wind: number | null }) => number; note: string }
> = {
  brochet: {
    label: "Brochet",
    note: "Préfère eau fraîche, ciel couvert, aube/crépuscule — heuristique V1.",
    shift: ({ water, cloud, hour }) => {
      let s = 0;
      if (water != null && water >= 10 && water <= 18) s += 4;
      if (water != null && water > 22) s -= 6;
      if (cloud != null && cloud >= 55) s += 3;
      if (hour != null && (hour <= 8 || hour >= 18)) s += 3;
      return s;
    },
  },
  sandre: {
    label: "Sandre",
    note: "Faible luminosité — heuristique V1.",
    shift: ({ cloud, hour }) => {
      let s = 0;
      if (cloud != null && cloud >= 70) s += 5;
      if (hour != null && (hour >= 19 || hour <= 6)) s += 5;
      if (hour != null && hour >= 11 && hour <= 16) s -= 4;
      return s;
    },
  },
  perche: {
    label: "Perche",
    note: "Conditions intermédiaires — heuristique V1.",
    shift: ({ water, hour }) => {
      let s = 0;
      if (water != null && water >= 12 && water <= 22) s += 3;
      if (hour != null && hour >= 7 && hour <= 11) s += 2;
      return s;
    },
  },
  "black-bass": {
    label: "Black-bass",
    note: "Eau plus chaude, plus de lumière — heuristique V1.",
    shift: ({ water, cloud }) => {
      let s = 0;
      if (water != null && water >= 18 && water <= 26) s += 6;
      if (water != null && water < 14) s -= 6;
      if (cloud != null && cloud < 40) s += 2;
      return s;
    },
  },
  silure: {
    label: "Silure",
    note: "Eau chaude, nuit — heuristique V1.",
    shift: ({ water, hour }) => {
      let s = 0;
      if (water != null && water >= 18) s += 5;
      if (hour != null && (hour >= 20 || hour <= 5)) s += 4;
      return s;
    },
  },
  anguille: {
    label: "Anguille",
    note: "Faible lumière — heuristique V1.",
    shift: ({ hour, cloud }) => {
      let s = 0;
      if (hour != null && (hour >= 20 || hour <= 5)) s += 6;
      if (cloud != null && cloud >= 80) s += 2;
      return s;
    },
  },
};

export function speciesScores(
  base: number | null,
  ctx: { water: number | null; cloud: number | null; hour: number | null; wind: number | null },
): { id: SpeciesId; label: string; score: number | null; note: string }[] {
  return (Object.keys(SPECIES_MODIFIERS) as SpeciesId[]).map((id) => {
    const m = SPECIES_MODIFIERS[id];
    return {
      id,
      label: m.label,
      score: base == null ? null : clamp(base + m.shift(ctx), 0, 100),
      note: m.note,
    };
  });
}
