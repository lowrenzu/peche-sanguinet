import { NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/services/snapshot";
import { buildPlan } from "@/lib/engines/plan";
import { addSession } from "@/lib/store/records";
import type { SpeciesId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    startIso?: string;
    durationHours?: number;
    species?: SpeciesId | "tous";
  };
  const snap = await buildSnapshot();
  if (!snap.ok) return NextResponse.json({ error: snap.error }, { status: 503 });
  const startIso = body.startIso ?? new Date().toISOString();
  const durationHours = Math.min(12, Math.max(1, body.durationHours ?? 4));
  const species = body.species ?? "tous";
  const slots = buildPlan({
    startIso,
    durationHours,
    species,
    hourly: snap.hourly.map((h) => ({
      time: h.time,
      ifScore: h.ifScore,
      water: h.waterTempC,
      cloud: h.cloudPct,
      wind: h.windKmh,
    })),
  });
  await addSession({
    id: crypto.randomUUID(),
    startIso,
    durationHours,
    species,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ startIso, durationHours, species, slots });
}
