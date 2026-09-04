import { NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/services/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await buildSnapshot();
  if (!snap.ok) return NextResponse.json({ error: snap.error }, { status: 503 });
  return NextResponse.json({
    if: snap.if,
    current: snap.current,
    water: snap.water,
    species: snap.species,
    window: snap.window,
    alerts: snap.alerts,
    source: snap.source,
  });
}
