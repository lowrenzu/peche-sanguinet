import { clamp } from "../format";

export function scoreCloud(opts: {
  cloudPct: number | null;
  hour?: number | null;
  precipMm?: number | null;
}): { score: number; detail: string; available: boolean } {
  if (opts.cloudPct == null) {
    return { score: 0, detail: "Donnée indisponible", available: false };
  }
  const c = opts.cloudPct;
  let score: number;
  if (c >= 60 && c <= 90) score = 92;
  else if (c > 90) score = 80;
  else if (c >= 40) score = 74;
  else if (c >= 20) score = 52;
  else score = 34;

  if (opts.precipMm != null && opts.precipMm > 2) score -= 10;
  if (opts.precipMm != null && opts.precipMm > 6) score -= 10;

  if (opts.hour != null && (opts.hour <= 8 || opts.hour >= 18)) score += 6;

  return {
    score: clamp(Math.round(score), 0, 100),
    detail: `${Math.round(c)} % de nébulosité${opts.precipMm && opts.precipMm > 0.2 ? `, ${opts.precipMm.toFixed(1)} mm` : ""}`,
    available: true,
  };
}
