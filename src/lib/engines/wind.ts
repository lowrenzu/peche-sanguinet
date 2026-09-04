import { clamp } from "../format";
import type { Cardinal } from "../types";

export function toCardinal(deg: number): Cardinal {
  const dirs: Cardinal[] = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

export function windVector(speedKmh: number, dirDeg: number): { u: number; v: number } {
  const rad = ((dirDeg + 180) * Math.PI) / 180;
  return {
    u: speedKmh * Math.sin(rad),
    v: speedKmh * Math.cos(rad),
  };
}

/**
 * Vent traité comme vecteur. Le score privilégie un vent modéré
 * (agitation, oxygénation) plutôt que le calme plat ou la tempête.
 * Ce n'est pas une vérité scientifique définitive — modèle V1.
 */
export function scoreWind(opts: {
  speedKmh: number | null;
  gustKmh?: number | null;
}): { score: number; detail: string; available: boolean } {
  if (opts.speedKmh === null || opts.speedKmh === undefined) {
    return { score: 0, detail: "Donnée indisponible", available: false };
  }
  const s = opts.speedKmh;
  let score: number;
  let band: string;
  if (s < 3) {
    score = 22;
    band = "calme plat";
  } else if (s < 8) {
    score = 58 + (s - 3) * 4;
    band = "faible";
  } else if (s <= 22) {
    score = 86 + (1 - Math.abs(s - 14) / 14) * 12;
    band = "modéré";
  } else if (s <= 32) {
    score = 72 - (s - 22) * 1.6;
    band = "soutenu";
  } else if (s <= 45) {
    score = 48 - (s - 32);
    band = "fort";
  } else {
    score = 12;
    band = "tempête";
  }

  if (opts.gustKmh != null && opts.speedKmh > 0 && opts.gustKmh > opts.speedKmh * 1.7) {
    score -= 8;
    band += ", rafales irrégulières";
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    detail: `${Math.round(s)} km/h — régime ${band}`,
    available: true,
  };
}

export function downwindBearing(fromDeg: number): number {
  return (fromDeg + 180) % 360;
}

function bearing(from: [number, number], to: [number, number]): number {
  const dLon = ((to[0] - from[0]) * Math.PI) / 180;
  const lat1 = (from[1] * Math.PI) / 180;
  const lat2 = (to[1] * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function angDiff(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

/** Rive sous le vent (côte battue), sans bathymétrie. */
export function exposedShore(
  polygon: [number, number][],
  windFromDeg: number,
): [number, number][] {
  const down = downwindBearing(windFromDeg);
  const cx = polygon.reduce((s, p) => s + p[0], 0) / polygon.length;
  const cy = polygon.reduce((s, p) => s + p[1], 0) / polygon.length;
  return polygon.filter((p) => angDiff(bearing([cx, cy], p), down) <= 55);
}
