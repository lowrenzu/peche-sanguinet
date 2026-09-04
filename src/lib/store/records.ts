import type { FishingSession, SavedLocation, ScoreLog, WaterMeasure } from "../types";
import { readJson, writeJson } from "./jsonStore";

export async function listWater(): Promise<WaterMeasure[]> {
  return (await readJson<WaterMeasure[]>("water_measures.json")) ?? [];
}

export async function addWater(m: WaterMeasure): Promise<WaterMeasure> {
  const all = await listWater();
  all.unshift(m);
  await writeJson("water_measures.json", all.slice(0, 400));
  return m;
}

export async function latestWater(): Promise<WaterMeasure | null> {
  const all = await listWater();
  return all[0] ?? null;
}

export async function listLocations(): Promise<SavedLocation[]> {
  return (await readJson<SavedLocation[]>("locations.json")) ?? [];
}

export async function addLocation(loc: SavedLocation): Promise<SavedLocation> {
  const all = await listLocations();
  all.unshift(loc);
  await writeJson("locations.json", all);
  return loc;
}

export async function deleteLocation(id: string): Promise<void> {
  const all = await listLocations();
  await writeJson(
    "locations.json",
    all.filter((l) => l.id !== id),
  );
}

export async function listSessions(): Promise<FishingSession[]> {
  return (await readJson<FishingSession[]>("sessions.json")) ?? [];
}

export async function addSession(s: FishingSession): Promise<FishingSession> {
  const all = await listSessions();
  all.unshift(s);
  await writeJson("sessions.json", all.slice(0, 200));
  return s;
}

export async function listScores(): Promise<ScoreLog[]> {
  return (await readJson<ScoreLog[]>("fishing_scores.json")) ?? [];
}

export async function appendScore(s: ScoreLog): Promise<void> {
  const all = await listScores();
  all.unshift(s);
  await writeJson("fishing_scores.json", all.slice(0, 2000));
}
