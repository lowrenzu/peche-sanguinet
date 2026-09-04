import { describe, expect, it } from "vitest";
import { computeFrenzy, levelFromScore, normalizeWeights } from "../src/lib/engines/fishing";
import { DEFAULT_CONFIG } from "../src/lib/config";

describe("IF engine", () => {
  it("sums factor points to a 0-100 score when all data is present", () => {
    const r = computeFrenzy({
      waterTempC: 14.5,
      waterDelta24h: 0.1,
      pressure: { current: 1014, h3: 1015, h6: 1016, h12: 1017, h24: 1018 },
      windKmh: 14,
      gustKmh: 18,
      cloudPct: 72,
      precipMm: 0,
      hour: 18,
      historicalScore: 70,
      historicalDetail: "test",
      weights: DEFAULT_CONFIG.weights,
    });
    expect(r.total).not.toBeNull();
    expect(r.total!).toBeGreaterThan(70);
    expect(r.total!).toBeLessThanOrEqual(100);
    expect(r.factors.reduce((a, f) => a + f.points, 0)).toBe(r.total);
  });

  it("does not invent a score when everything is missing", () => {
    const r = computeFrenzy({
      waterTempC: null,
      pressure: { current: null, h3: null, h6: null, h12: null, h24: null },
      windKmh: null,
      cloudPct: null,
      historicalScore: null,
      historicalDetail: "none",
      weights: DEFAULT_CONFIG.weights,
    });
    expect(r.total).toBeNull();
    expect(r.factors.every((f) => !f.available)).toBe(true);
  });

  it("renormalizes weights when historical is missing", () => {
    const n = normalizeWeights(DEFAULT_CONFIG.weights, {
      water: true,
      pressure: true,
      wind: true,
      cloud: true,
      historical: false,
    });
    const sum = n.water + n.pressure + n.wind + n.cloud + n.historical;
    expect(n.historical).toBe(0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("maps configurable thresholds", () => {
    expect(levelFromScore(10, DEFAULT_CONFIG.levels)).toBe("TRES_MAUVAIS");
    expect(levelFromScore(30, DEFAULT_CONFIG.levels)).toBe("FAIBLE");
    expect(levelFromScore(50, DEFAULT_CONFIG.levels)).toBe("MOYEN");
    expect(levelFromScore(70, DEFAULT_CONFIG.levels)).toBe("BON");
    expect(levelFromScore(80, DEFAULT_CONFIG.levels)).toBe("TRES_BON");
    expect(levelFromScore(95, DEFAULT_CONFIG.levels)).toBe("EXCEPTIONNEL");
  });
});
