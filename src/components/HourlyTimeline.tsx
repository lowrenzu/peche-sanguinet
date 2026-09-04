"use client";

import { useEffect, useRef } from "react";
import { bestFishingWindows, nowHourIndex } from "@/lib/engines/explain";
import { formatTime } from "@/lib/format";
import type { HourlyPoint } from "@/lib/types";
import { scoreBg, scoreColor } from "./ui";

export function HourlyTimeline({ points }: { points: HourlyPoint[] }) {
  const hours = points.slice(0, 24);
  const nowIdx = nowHourIndex(hours);
  const peaks = new Set(bestFishingWindows(hours, 3).map((w) => w.peakIdx));
  const nowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nowRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [nowIdx]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {hours.map((h, i) => {
        const isNow = i === nowIdx;
        const isPeak = peaks.has(i);
        return (
          <div
            key={h.time}
            ref={isNow ? nowRef : undefined}
            className={`relative min-w-[58px] rounded-xl px-2 py-3 text-center ${scoreBg(h.ifScore)} ${
              isNow ? "ring-2 ring-mist-100" : ""
            } ${isPeak ? "ring-2 ring-gold" : ""}`}
          >
            {isNow && (
              <p className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-mist-100 px-1 text-[9px] font-semibold uppercase tracking-wide text-ink-950">
                now
              </p>
            )}
            {isPeak && !isNow && (
              <p className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-gold px-1 text-[9px] font-semibold uppercase tracking-wide text-ink-950">
                pic
              </p>
            )}
            <p className="text-[10px] text-mist-500">{formatTime(h.time)}</p>
            <p className={`mt-1 font-mono text-lg tabular ${scoreColor(h.ifScore)}`}>
              {h.ifScore ?? "—"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
