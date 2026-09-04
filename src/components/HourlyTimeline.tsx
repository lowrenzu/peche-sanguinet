"use client";

import { useEffect, useRef } from "react";
import { bestFishingWindows, nowHourIndex } from "@/lib/engines/explain";
import { formatTime } from "@/lib/format";
import type { HourlyPoint } from "@/lib/types";
import { scoreColor, scoreBg } from "./ui";
import { Sparkles } from "lucide-react";

const BAR_MAX_PX = 84;

export function HourlyTimeline({ points }: { points: HourlyPoint[] }) {
  const hours = points.slice(0, 24);
  const nowIdx = nowHourIndex(hours);
  const peaks = new Set(bestFishingWindows(hours, 3).map((w) => w.peakIdx));
  const nowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nowRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [nowIdx]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-3 pt-1" style={{ scrollbarWidth: "thin" }}>
      {hours.map((h, i) => {
        const isNow = i === nowIdx;
        const isPeak = peaks.has(i);
        const barH = Math.max(5, Math.round(((h.ifScore ?? 0) / 100) * BAR_MAX_PX));

        return (
          <div
            key={h.time}
            ref={isNow ? nowRef : undefined}
            className="flex min-w-[44px] flex-col items-center gap-1"
          >
            {/* Peak / sparkle marker */}
            <div className="flex h-5 items-center justify-center">
              {isPeak && (
                <Sparkles
                  className={`h-3.5 w-3.5 ${
                    isNow
                      ? "text-mist-100 anim-pulse-ring"
                      : "text-gold anim-golden-pulse"
                  }`}
                />
              )}
            </div>

            {/* Score label */}
            <p
              className={`font-mono text-[10px] tabular leading-none ${scoreColor(h.ifScore)}`}
            >
              {h.ifScore ?? "—"}
            </p>

            {/* Bar column */}
            <div
              className="flex items-end"
              style={{ height: BAR_MAX_PX }}
            >
              <div
                className={`anim-bar-grow w-8 rounded-t-md ${scoreBg(h.ifScore)} ${
                  isNow ? "ring-1 ring-inset ring-mist-100/50" : ""
                } ${isPeak && !isNow ? "ring-1 ring-inset ring-gold/40" : ""}`}
                style={{
                  height: barH,
                  animationDelay: `${i * 22}ms`,
                }}
              />
            </div>

            {/* Time label + now dot */}
            <div className="flex flex-col items-center gap-0.5">
              {isNow && (
                <div className="anim-pulse-ring h-1.5 w-1.5 rounded-full bg-teal" />
              )}
              <p
                className={`text-[10px] leading-none ${
                  isNow ? "font-semibold text-teal" : "text-mist-500"
                }`}
              >
                {formatTime(h.time)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
