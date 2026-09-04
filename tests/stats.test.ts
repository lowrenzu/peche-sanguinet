import { describe, expect, it } from "vitest";
import { analyzeCatches, empiricalSpeciesShift } from "../src/lib/engines/stats";
import { applyWaterMeasure } from "../src/lib/engines/water";
import type { CatchRecord } from "../src/lib/types";

function catchAt(hour: string, ifScore: number, species: CatchRecord["species"] = "brochet"): CatchRecord {
  return {
    id: hour,
    date: "2026-09-01",
    time: hour,
    lat: null,
    lon: null,
    species,
    lengthCm: 70,
    weightKg: null,
    lure: "",
    technique: "",
    depthM: null,
    comment: "",
    photoPath: null,
    weatherSnapshot: {
      airTempC: 18,
      waterTempC: 16,
      pressureHpa: 1014,
      windKmh: 12,
      windCardinal: "O",
      cloudPct: 70,
      ifScore,
    },
    createdAt: "2026-09-01T10:00:00.000Z",
  };
}

describe("local stats", () => {
  it("does not invent catch probability with empty journal", () => {
    const s = analyzeCatches([]);
    expect(s.n).toBe(0);
    expect(s.ready).toBe(false);
    expect(s.alignment.ready).toBe(false);
  });

  it("computes hour histogram and mean IF", () => {
    const s = analyzeCatches([
      catchAt("18:00", 80),
      catchAt("18:30", 82),
      catchAt("07:00", 60),
      catchAt("18:10", 78),
      catchAt("19:00", 84),
    ]);
    expect(s.n).toBe(5);
    expect(s.ready).toBe(true);
    expect(s.byHour[18]).toBe(3);
    expect(s.meanIfAtCatch).toBeGreaterThan(70);
  });

  it("keeps species uncalibrated under 8 catches", () => {
    expect(empiricalSpeciesShift([catchAt("18:00", 80)], "brochet", 18).calibrated).toBe(false);
  });
});

describe("water measure overlay", () => {
  const est = {
    value: 19,
    kind: "estimation" as const,
    confidence: "moyenne" as const,
    note: "est",
  };

  it("uses a fresh in-situ measure as MESURE", () => {
    const r = applyWaterMeasure(est, {
      id: "1",
      tempC: 17.2,
      at: new Date().toISOString(),
      source: "pecheur",
      note: "",
    });
    expect(r.kind).toBe("mesure");
    expect(r.value).toBe(17.2);
    expect(r.measured).toBe(true);
  });

  it("does not present a 2-day-old measure as current", () => {
    const old = new Date(Date.now() - 48 * 3600_000).toISOString();
    const r = applyWaterMeasure(est, {
      id: "1",
      tempC: 12,
      at: old,
      source: "pecheur",
      note: "",
    });
    expect(r.kind).toBe("estimation");
    expect(r.measured).toBe(false);
  });
});
