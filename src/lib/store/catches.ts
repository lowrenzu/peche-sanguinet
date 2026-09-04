import type { CatchRecord } from "../types";
import { readJson, writeJson } from "./jsonStore";

export async function listCatches(): Promise<CatchRecord[]> {
  return (await readJson<CatchRecord[]>("catches.json")) ?? [];
}

export async function addCatch(record: CatchRecord): Promise<CatchRecord> {
  const all = await listCatches();
  all.unshift(record);
  await writeJson("catches.json", all);
  return record;
}

export async function deleteCatch(id: string): Promise<void> {
  const all = await listCatches();
  await writeJson(
    "catches.json",
    all.filter((c) => c.id !== id),
  );
}
