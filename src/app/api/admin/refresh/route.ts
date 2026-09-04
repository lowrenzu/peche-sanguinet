import { NextResponse } from "next/server";
import { clearWeatherCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function POST() {
  const n = await clearWeatherCache();
  return NextResponse.json({ ok: true, cleared: n });
}
