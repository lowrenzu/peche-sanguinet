import { describe, expect, it } from "vitest";
import { pressureDeltas, scorePressure } from "../src/lib/engines/pressure";

describe("pressure", () => {
  it("computes 3/6/12/24h deltas", () => {
    const d = pressureDeltas({
      current: 1012,
      h3: 1013,
      h6: 1014,
      h12: 1016,
      h24: 1018,
    });
    expect(d.d12).toBe(-4);
    expect(d.d24).toBe(-6);
  });

  it("scores a moderate drop higher than a isolated 1015 hPa", () => {
    const drop = scorePressure({
      current: 1014,
      h3: 1015,
      h6: 1016,
      h12: 1017,
      h24: 1018,
    });
    const isolated = scorePressure({
      current: 1015,
      h3: null,
      h6: null,
      h12: null,
      h24: null,
    });
    expect(drop.available).toBe(true);
    expect(drop.score).toBeGreaterThan(isolated.score);
  });

  it("returns unavailable when current is missing", () => {
    const r = scorePressure({
      current: null,
      h3: 1015,
      h6: 1015,
      h12: 1015,
      h24: 1015,
    });
    expect(r.available).toBe(false);
    expect(r.detail).toBe("Donnée indisponible");
  });
});
