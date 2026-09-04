import { NextResponse } from "next/server";
import { listCatches } from "@/lib/store/catches";
import { analyzeCatches } from "@/lib/engines/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const catches = await listCatches();
  return NextResponse.json(analyzeCatches(catches));
}
