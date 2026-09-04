import { NextResponse } from "next/server";
import { addSession, listSessions } from "@/lib/store/records";
import type { SpeciesId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ sessions: await listSessions() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    startIso?: string;
    durationHours?: number;
    species?: SpeciesId | "tous";
  };
  const s = await addSession({
    id: crypto.randomUUID(),
    startIso: body.startIso ?? new Date().toISOString(),
    durationHours: body.durationHours ?? 4,
    species: body.species ?? "tous",
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(s);
}
