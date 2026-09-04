import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addCatch, deleteCatch, listCatches } from "@/lib/store/catches";
import { buildSnapshot } from "@/lib/services/snapshot";
import type { CatchRecord, SpeciesId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ catches: await listCatches() });
}

async function weatherNow() {
  const snap = await buildSnapshot();
  if (!snap.ok) {
    return {
      airTempC: null,
      waterTempC: null,
      pressureHpa: null,
      windKmh: null,
      windCardinal: null,
      cloudPct: null,
      ifScore: null,
    };
  }
  return {
    airTempC: snap.current.airTempC,
    waterTempC: snap.water.tempC,
    pressureHpa: snap.current.pressureHpa,
    windKmh: snap.current.windKmh,
    windCardinal: snap.current.windCardinal,
    cloudPct: snap.current.cloudPct,
    ifScore: snap.if.score,
  };
}

async function savePhoto(file: File, id: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = file.type.includes("png") ? "png" : "jpg";
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const name = `${id}.${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  let species: SpeciesId;
  let date: string;
  let time = "12:00";
  let lengthCm: number | null = null;
  let weightKg: number | null = null;
  let lure = "";
  let technique = "";
  let depthM: number | null = null;
  let comment = "";
  let lat: number | null = null;
  let lon: number | null = null;
  let photo: File | null = null;

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    species = String(form.get("species")) as SpeciesId;
    date = String(form.get("date"));
    time = String(form.get("time") ?? "12:00");
    lengthCm = form.get("lengthCm") ? Number(form.get("lengthCm")) : null;
    weightKg = form.get("weightKg") ? Number(form.get("weightKg")) : null;
    lure = String(form.get("lure") ?? "");
    technique = String(form.get("technique") ?? "");
    depthM = form.get("depthM") ? Number(form.get("depthM")) : null;
    comment = String(form.get("comment") ?? "");
    lat = form.get("lat") ? Number(form.get("lat")) : null;
    lon = form.get("lon") ? Number(form.get("lon")) : null;
    const f = form.get("photo");
    photo = f instanceof File ? f : null;
  } else {
    const body = (await req.json()) as Partial<CatchRecord>;
    species = body.species as SpeciesId;
    date = body.date ?? "";
    time = body.time ?? "12:00";
    lengthCm = body.lengthCm ?? null;
    weightKg = body.weightKg ?? null;
    lure = body.lure ?? "";
    technique = body.technique ?? "";
    depthM = body.depthM ?? null;
    comment = body.comment ?? "";
    lat = body.lat ?? null;
    lon = body.lon ?? null;
  }

  if (!species || !date) {
    return NextResponse.json({ error: "Espèce et date requises" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const photoPath = photo ? await savePhoto(photo, id) : null;
  const weatherSnapshot = await weatherNow();

  const record: CatchRecord = {
    id,
    date,
    time,
    lat,
    lon,
    species,
    lengthCm,
    weightKg,
    lure,
    technique,
    depthM,
    comment,
    photoPath,
    weatherSnapshot,
    createdAt: new Date().toISOString(),
  };
  await addCatch(record);
  return NextResponse.json(record);
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });
  await deleteCatch(id);
  return NextResponse.json({ ok: true });
}
