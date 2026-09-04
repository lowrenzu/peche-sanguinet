import { describe, expect, it } from "vitest";
import {
  analogDistance,
  catchRateOnAnalogs,
  findAnalogs,
  historicalFactor,
  type DailyClimate,
} from "../src/lib/engines/historical";

const day = (date: string, extra: Partial<DailyClimate> = {}): DailyClimate => ({
  date,
  airTempC: 18,
  pressureHpa: 1015,
  pressureDelta: -2,
  windKmh: 12,
  windDirDeg: 270,
  cloudPct: 70,
  ...extra,
});

describe("historical matching", () => {
  it("finds close meteorological analogs", () => {
    const archive = [
      day("2024-09-01"),
      day("2023-09-04", { airTempC: 18.2 }),
      day("2022-01-01", { airTempC: 4, pressureHpa: 1030, windKmh: 2, cloudPct: 10 }),
    ];
    const r = findAnalogs(day("2026-09-04"), archive, []);
    expect(r.similarCount).toBeGreaterThan(0);
    expect(r.analogs[0].date).not.toBe("2022-01-01");
  });

  it("does not invent a catch probability without catches", () => {
    const analogs = findAnalogs(day("2026-09-04"), [day("2024-09-01"), day("2023-09-04")], []).analogs;
    expect(catchRateOnAnalogs(analogs).rate).toBeNull();
  });

  it("returns null historical score if archive is too short", () => {
    expect(historicalFactor({ similarCount: 3, meanDistance: 0.1, archiveDays: 5 }).score).toBeNull();
  });

  it("distance is 0 for identical days (except date)", () => {
    const a = day("2024-09-04");
    const b = day("2025-09-04");
    expect(analogDistance(a, b)).toBeLessThan(0.05);
  });
});
