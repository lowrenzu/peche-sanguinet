import { NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/config";
import type { AppConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<AppConfig>;
  const current = await getConfig();
  const next: AppConfig = {
    ...current,
    ...body,
    weights: { ...current.weights, ...body.weights },
    levels: { ...current.levels, ...body.levels },
  };
  await saveConfig(next);
  return NextResponse.json(next);
}
