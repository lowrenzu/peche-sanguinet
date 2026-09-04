import { NextResponse } from "next/server";
import { addLocation, deleteLocation, listLocations } from "@/lib/store/records";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ locations: await listLocations() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string; lat?: number; lon?: number };
  if (!body.name || body.lat == null || body.lon == null) {
    return NextResponse.json({ error: "nom et coordonnées requis" }, { status: 400 });
  }
  const loc = await addLocation({
    id: crypto.randomUUID(),
    name: body.name,
    lat: Number(body.lat),
    lon: Number(body.lon),
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(loc);
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  await deleteLocation(id);
  return NextResponse.json({ ok: true });
}
