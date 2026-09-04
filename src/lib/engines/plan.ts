import type { FishingPlanSlot, SpeciesId } from "../types";
import { SPECIES_MODIFIERS } from "./fishing";
import { clamp } from "../format";

export function buildPlan(opts: {
  startIso: string;
  durationHours: number;
  species: SpeciesId | "tous";
  hourly: { time: string; ifScore: number | null; water: number | null; cloud: number | null; wind: number | null }[];
}): FishingPlanSlot[] {
  const start = new Date(opts.startIso).getTime();
  const end = start + opts.durationHours * 3600_000;
  const window = opts.hourly.filter((h) => {
    const t = new Date(h.time).getTime();
    return t >= start - 20 * 60_000 && t <= end + 20 * 60_000;
  });
  if (!window.length) return [];

  const adjusted = window.map((h) => {
    let s = h.ifScore;
    if (s != null && opts.species !== "tous") {
      const hour = new Date(h.time).getHours();
      s = clamp(
        s +
          SPECIES_MODIFIERS[opts.species].shift({
            water: h.water,
            cloud: h.cloud,
            hour,
            wind: h.wind,
          }),
        0,
        100,
      );
    }
    return { ...h, ifScore: s };
  });

  const slots: FishingPlanSlot[] = [];
  const step = Math.max(2, Math.round(adjusted.length / 3));
  for (let i = 0; i < adjusted.length; i += step) {
    const chunk = adjusted.slice(i, i + step).filter((x) => x.ifScore != null);
    if (!chunk.length) continue;
    const avg = Math.round(chunk.reduce((a, x) => a + (x.ifScore ?? 0), 0) / chunk.length);
    slots.push({
      from: chunk[0].time,
      to: chunk[chunk.length - 1].time,
      ifScore: avg,
      label: avg >= 76 ? "Meilleure fenêtre" : avg >= 61 ? "Conditions favorables" : avg >= 41 ? "Correct" : "Peu favorable",
      best: false,
    });
  }
  if (!slots.length) return slots;
  const max = Math.max(...slots.map((s) => s.ifScore));
  return slots.map((s) => ({ ...s, best: s.ifScore === max && max >= 61 }));
}
