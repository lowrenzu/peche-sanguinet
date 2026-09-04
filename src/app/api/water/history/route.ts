import { NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/services/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await buildSnapshot();
  if (!snap.ok) return NextResponse.json({ error: snap.error }, { status: 503 });
  return NextResponse.json({
    kind: "estimation",
    note: snap.water.note,
    series: snap.hourlyAll.map((h) => ({
      time: h.time,
      waterTempC: h.waterTempC,
      airTempC: h.airTempC,
    })),
  });
}
