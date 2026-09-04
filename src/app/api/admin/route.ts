import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { readJson } from "@/lib/store/jsonStore";
import { getCached } from "@/lib/cache";
import { listCatches } from "@/lib/store/catches";
import { listScores, listWater } from "@/lib/store/records";
import { sectorById } from "@/lib/lake";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getConfig();
  const sector = sectorById(config.sectorId);
  const errors = (await readJson<{ at: string; source: string; message: string }[]>("errors.json")) ?? [];
  const forecast = await getCached<unknown>(`forecast-${sector.id}`);
  const archive = await getCached<unknown>(`archive-${sector.id}-5y`);
  const catches = await listCatches();
  const scores = await listScores();
  const water = await listWater();
  return NextResponse.json({
    config,
    sector,
    apis: [
      {
        name: "Open-Meteo forecast",
        last: forecast?.fetchedAt ?? null,
        status: forecast ? "ok" : "manquant",
      },
      {
        name: "Open-Meteo ERA5 archive",
        last: archive?.fetchedAt ?? null,
        status: archive ? "ok" : "manquant",
      },
    ],
    errors,
    catchCount: catches.length,
    waterCount: water.length,
    scores: scores.slice(0, 48),
  });
}
