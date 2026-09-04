import { NextResponse } from "next/server";
import { loadArchive, archiveToClimate } from "@/lib/providers/openMeteo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const years = Number(new URL(req.url).searchParams.get("years") ?? "1");
  try {
    const pack = await loadArchive(Math.min(5, Math.max(1, years)));
    return NextResponse.json({
      source: pack.source,
      fetchedAt: pack.fetchedAt,
      stale: pack.stale,
      days: archiveToClimate(pack.data),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Donnée indisponible" },
      { status: 503 },
    );
  }
}
