import { describe, expect, it } from "vitest";
import { bestFishingWindows, nowHourIndex } from "../src/lib/engines/explain";

describe("best fishing windows", () => {
  const series = [
    { time: "2026-09-04T14:00:00", ifScore: 70 },
    { time: "2026-09-04T15:00:00", ifScore: 71 },
    { time: "2026-09-04T18:00:00", ifScore: 82 },
    { time: "2026-09-04T19:00:00", ifScore: 84 },
    { time: "2026-09-04T20:00:00", ifScore: 80 },
    { time: "2026-09-04T21:00:00", ifScore: 68 },
    { time: "2026-09-05T02:00:00", ifScore: 83 },
    { time: "2026-09-05T03:00:00", ifScore: 81 },
  ];

  it("keeps local peaks instead of a long gold band", () => {
    const flat = Array.from({ length: 20 }, (_, i) => ({
      time: `2026-09-04T${String(i).padStart(2, "0")}:00:00`,
      ifScore: 77 + (i === 8 ? 6 : i === 15 ? 5 : 0),
    }));
    const w = bestFishingWindows(flat);
    expect(w.length).toBeLessThanOrEqual(3);
    expect(w.some((x) => x.peak === 83)).toBe(true);
  });

  it("marks consecutive high hours as windows and keeps the peak", () => {
    const w = bestFishingWindows(series);
    expect(w.length).toBeGreaterThanOrEqual(2);
    expect(w[0].peak).toBe(84);
    expect(w[0].from).toBe("2026-09-04T18:00:00");
    expect(w[0].to).toBe("2026-09-04T20:00:00");
  });

  it("returns nothing when scores are missing", () => {
    expect(bestFishingWindows([{ time: "x", ifScore: null }])).toEqual([]);
  });

  it("finds the hour closest to now", () => {
    const idx = nowHourIndex(series, new Date("2026-09-04T19:10:00").getTime());
    expect(series[idx].time).toBe("2026-09-04T19:00:00");
  });
});
