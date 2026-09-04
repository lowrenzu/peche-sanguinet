import type { CatchRecord, SpeciesId } from "../types";
import { SPECIES_MODIFIERS } from "./fishing";

function avg(xs: number[]): number | null {
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function analyzeCatches(catches: CatchRecord[]) {
  const byHour = Array.from({ length: 24 }, () => 0);
  const bySpecies: Record<string, number> = {};
  for (const c of catches) {
    const h = Number(String(c.time).slice(0, 2));
    if (!Number.isNaN(h) && h >= 0 && h < 24) byHour[h] += 1;
    bySpecies[c.species] = (bySpecies[c.species] ?? 0) + 1;
  }
  const ifs = catches
    .map((c) => c.weatherSnapshot.ifScore)
    .filter((v): v is number => v != null);
  const waters = catches
    .map((c) => c.weatherSnapshot.waterTempC)
    .filter((v): v is number => v != null);
  const bestHours = byHour
    .map((n, h) => ({ h, n }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);

  return {
    n: catches.length,
    ready: catches.length >= 5,
    byHour,
    bySpecies,
    meanIfAtCatch: avg(ifs),
    meanWaterAtCatch: avg(waters),
    bestHours,
    alignment:
      ifs.length >= 8
        ? {
            ready: true as const,
            meanIf: Number(avg(ifs)!.toFixed(1)),
            note:
              avg(ifs)! >= 60
                ? "Les prises enregistrées arrivent surtout par IF élevé : le modèle V1 n'est pas contredit par votre journal."
                : "Des prises arrivent à IF modéré : le modèle V1 n'est pas encore spécifique à vos sessions.",
          }
        : {
            ready: false as const,
            meanIf: avg(ifs),
            note: "Il faut au moins 8 captures avec IF collé pour juger l'alignement du modèle.",
          },
  };
}

export function empiricalSpeciesShift(
  catches: CatchRecord[],
  species: SpeciesId,
  hour: number | null,
): { shift: number; calibrated: boolean; n: number } {
  const xs = catches.filter((c) => c.species === species);
  if (xs.length < 8) return { shift: 0, calibrated: false, n: xs.length };
  const hours = xs
    .map((c) => Number(String(c.time).slice(0, 2)))
    .filter((h) => !Number.isNaN(h));
  const meanH = avg(hours);
  if (meanH == null || hour == null) return { shift: 2, calibrated: true, n: xs.length };
  const dist = Math.abs(((hour - meanH + 12) % 24) - 12);
  const shift = dist <= 2 ? 6 : dist <= 4 ? 3 : -2;
  return { shift, calibrated: true, n: xs.length };
}

export function speciesWithLocalStats(
  base: ReturnType<typeof import("./fishing").speciesScores>,
  catches: CatchRecord[],
  hour: number | null,
) {
  return base.map((s) => {
    const emp = empiricalSpeciesShift(catches, s.id, hour);
    if (!emp.calibrated || s.score == null) {
      return { ...s, calibrated: false as const, n: emp.n };
    }
    const score = Math.max(0, Math.min(100, s.score + emp.shift));
    return {
      ...s,
      score,
      calibrated: true as const,
      n: emp.n,
      note: `Calibré sur ${emp.n} captures locales ${SPECIES_MODIFIERS[s.id].label.toLowerCase()} + heuristique V1.`,
    };
  });
}
