import { describe, expect, it } from "vitest";
import { scoreWind, toCardinal, windVector } from "../src/lib/engines/wind";

describe("wind", () => {
  it("uses French cardinals", () => {
    expect(toCardinal(0)).toBe("N");
    expect(toCardinal(90)).toBe("E");
    expect(toCardinal(180)).toBe("S");
    expect(toCardinal(270)).toBe("O");
    expect(toCardinal(225)).toBe("SO");
  });

  it("stores a vector", () => {
    const v = windVector(10, 270);
    expect(v.u).not.toBe(0);
    expect(Number.isFinite(v.v)).toBe(true);
  });

  it("prefers moderate wind over flat calm or storm", () => {
    const mid = scoreWind({ speedKmh: 14 });
    const calm = scoreWind({ speedKmh: 1 });
    const storm = scoreWind({ speedKmh: 55 });
    expect(mid.score).toBeGreaterThan(calm.score);
    expect(mid.score).toBeGreaterThan(storm.score);
  });

  it("does not invent wind", () => {
    expect(scoreWind({ speedKmh: null }).available).toBe(false);
  });
});
