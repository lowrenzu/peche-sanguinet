import { describe, expect, it } from "vitest";
import { climatologyAt, estimateWaterTempC, scoreWater } from "../src/lib/engines/water";

describe("water engine", () => {
  it("never treats air as a measurement of water", () => {
    const est = estimateWaterTempC({
      at: new Date("2026-09-04T12:00:00"),
      airMean5d: 28,
      airNow: 30,
    });
    expect(est.kind).toBe("estimation");
    expect(est.value).toBeLessThan(28);
  });

  it("uses climatology fallback with low confidence", () => {
    const est = estimateWaterTempC({
      at: new Date("2026-01-15T12:00:00Z"),
      airMean5d: null,
      airNow: null,
    });
    expect(est.confidence).toBe("faible");
    expect(est.value).toBeCloseTo(climatologyAt(new Date("2026-01-15T12:00:00Z")), 0);
  });

  it("scores the V1 optimal band highest", () => {
    const good = scoreWater({ tempC: 14 });
    const hot = scoreWater({ tempC: 27 });
    const missing = scoreWater({ tempC: null });
    expect(good.score).toBeGreaterThan(hot.score);
    expect(missing.available).toBe(false);
  });
});
