import type { AppConfig } from "./types";
import { readJson, writeJson } from "./store/jsonStore";

export const DEFAULT_CONFIG: AppConfig = {
  weights: {
    water: 0.3,
    pressure: 0.2,
    wind: 0.2,
    cloud: 0.15,
    historical: 0.15,
  },
  levels: {
    tresMauvais: 0,
    faible: 21,
    moyen: 41,
    bon: 61,
    tresBon: 76,
    exceptionnel: 91,
  },
  cacheTtlMinutes: 20,
  sectorId: "sanguinet",
  anglerName: "",
  notifications: false,
};

export async function getConfig(): Promise<AppConfig> {
  const stored = await readJson<AppConfig>("config.json");
  if (!stored) return DEFAULT_CONFIG;
  return {
    weights: { ...DEFAULT_CONFIG.weights, ...stored.weights },
    levels: { ...DEFAULT_CONFIG.levels, ...stored.levels },
    cacheTtlMinutes: stored.cacheTtlMinutes ?? DEFAULT_CONFIG.cacheTtlMinutes,
    sectorId: stored.sectorId ?? DEFAULT_CONFIG.sectorId,
    anglerName: stored.anglerName ?? "",
    notifications: stored.notifications ?? false,
  };
}

export async function saveConfig(next: AppConfig): Promise<void> {
  const sum =
    next.weights.water +
    next.weights.pressure +
    next.weights.wind +
    next.weights.cloud +
    next.weights.historical;
  if (sum <= 0) throw new Error("Les pondérations doivent être > 0");
  await writeJson("config.json", next);
}
