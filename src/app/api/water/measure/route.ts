import { NextResponse } from "next/server";
import { addWater, listWater } from "@/lib/store/records";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ measures: await listWater() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { tempC?: number; note?: string };
  if (body.tempC == null || Number.isNaN(Number(body.tempC))) {
    return NextResponse.json({ error: "tempC requis" }, { status: 400 });
  }
  const m = await addWater({
    id: crypto.randomUUID(),
    tempC: Number(body.tempC),
    at: new Date().toISOString(),
    source: "pecheur",
    note: body.note ?? "",
  });
  return NextResponse.json(m);
}
