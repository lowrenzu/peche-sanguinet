"use client";

import { useEffect, useRef } from "react";
import { bestFishingWindows, nowHourIndex } from "@/lib/engines/explain";
import { formatTime } from "@/lib/format";
import type { HourlyPoint } from "@/lib/types";
import { scoreColor } from "./ui";
import { Sparkles, Wind, CloudRain, Cloud } from "lucide-react";

const BAR_MAX_PX = 128;

function scoreBarGradient(score: number | null): string {
  if (score == null) return "linear-gradient(to top, rgba(139,155,176,0.08), rgba(139,155,176,0.15))";
  if (score >= 76)
    return "linear-gradient(to top, rgba(61,220,151,0.12), rgba(61,220,151,0.55), rgba(61,220,151,0.85))";
  if (score >= 61)
    return "linear-gradient(to top, rgba(46,196,182,0.10), rgba(46,196,182,0.45), rgba(46,196,182,0.75))";
  if (score >= 41)
    return "linear-gradient(to top, rgba(245,197,66,0.10), rgba(245,197,66,0.40), rgba(245,197,66,0.65))";
  return "linear-gradient(to top, rgba(255,107,74,0.10), rgba(255,107,74,0.35), rgba(255,107,74,0.55))";
}

function barGlowShadow(score: number | null): string {
  if (score == null) return "none";
  if (score >= 76) return "0 -4px 18px rgba(61,220,151,0.35), inset 0 1px 0 rgba(61,220,151,0.4)";
  if (score >= 61) return "0 -4px 18px rgba(46,196,182,0.30), inset 0 1px 0 rgba(46,196,182,0.35)";
  if (score >= 41) return "0 -4px 14px rgba(245,197,66,0.22), inset 0 1px 0 rgba(245,197,66,0.25)";
  return "0 -4px 14px rgba(255,107,74,0.20), inset 0 1px 0 rgba(255,107,74,0.2)";
}

function WeatherMicro({ h }: { h: HourlyPoint }) {
  if (h.precipMm != null && h.precipMm > 0.3)
    return <CloudRain className="h-3 w-3 text-signal-mid/70" />;
  if (h.cloudPct != null && h.cloudPct > 60)
    return <Cloud className="h-3 w-3 text-mist-500/50" />;
  if (h.windKmh != null && h.windKmh > 30)
    return <Wind className="h-3 w-3 text-mist-500/50" />;
  return null;
}

export function HourlyTimeline({ points }: { points: HourlyPoint[] }) {
  const hours = points.slice(0, 24);
  const nowIdx = nowHourIndex(hours);
  const windows = bestFishingWindows(hours, 3);
  const peaks = new Set(windows.map((w) => w.peakIdx));

  // Build a set of indices that are inside a "best window" range
  const windowIndices = new Set<number>();
  for (const w of windows) {
    for (let i = w.startIdx; i <= w.endIdx; i++) windowIndices.add(i);
  }

  const nowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nowRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [nowIdx]);

  // Find max score for relative sizing
  const maxScore = Math.max(...hours.map((h) => h.ifScore ?? 0), 1);

  return (
    <div className="relative">
      {/* Legend strip */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-mist-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-teal anim-pulse-ring" /> Maintenant
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-gold" /> Pic de frénésie
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-6 rounded-sm bg-gold/20 border border-gold/30" /> Fenêtre optimale
        </span>
      </div>

      {/* Scrollable bar chart */}
      <div
        className="flex gap-1 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "thin" }}
      >
        {hours.map((h, i) => {
          const isNow = i === nowIdx;
          const isPeak = peaks.has(i);
          const inWindow = windowIndices.has(i);
          const score = h.ifScore ?? 0;
          const barH = Math.max(6, Math.round((score / 100) * BAR_MAX_PX));

          return (
            <div
              key={h.time}
              ref={isNow ? nowRef : undefined}
              className={`snap-center flex min-w-[48px] flex-col items-center ${
                isNow ? "z-10" : ""
              }`}
            >
              {/* ── Peak sparkle ── */}
              <div className="flex h-6 items-center justify-center">
                {isPeak && (
                  <span className="relative">
                    <Sparkles className="h-4 w-4 text-gold drop-shadow-[0_0_6px_rgba(212,168,83,0.8)]" />
                    <span className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold anim-golden-pulse" />
                  </span>
                )}
              </div>

              {/* ── Score number ── */}
              <p
                className={`mb-1 font-mono text-xs tabular font-semibold leading-none ${scoreColor(
                  h.ifScore
                )} ${isPeak ? "text-sm" : ""}`}
                style={
                  isPeak
                    ? {
                        textShadow:
                          score >= 76
                            ? "0 0 12px rgba(61,220,151,0.7)"
                            : score >= 61
                            ? "0 0 12px rgba(46,196,182,0.7)"
                            : "0 0 10px rgba(245,197,66,0.6)",
                      }
                    : undefined
                }
              >
                {h.ifScore ?? "—"}
              </p>

              {/* ── Bar column ── */}
              <div
                className="relative flex items-end"
                style={{ height: BAR_MAX_PX }}
              >
                {/* Window background highlight */}
                {inWindow && (
                  <div
                    className="absolute inset-x-[-4px] inset-y-0 rounded-md border border-gold/15 bg-gold/5"
                  />
                )}

                {/* The bar itself */}
                <div
                  className={`anim-bar-grow relative w-9 rounded-t-lg ${
                    isNow ? "w-10" : ""
                  }`}
                  style={{
                    height: barH,
                    background: scoreBarGradient(h.ifScore),
                    boxShadow: barGlowShadow(h.ifScore),
                    animationDelay: `${i * 28}ms`,
                    border: isNow
                      ? "1px solid rgba(46,196,182,0.6)"
                      : isPeak
                      ? "1px solid rgba(212,168,83,0.35)"
                      : "1px solid rgba(255,255,255,0.04)",
                    borderBottom: "none",
                  }}
                >
                  {/* Top glow line for high scores */}
                  {score >= 61 && (
                    <div
                      className="absolute inset-x-0 top-0 h-px rounded-full"
                      style={{
                        background:
                          score >= 76
                            ? "rgba(61,220,151,0.8)"
                            : "rgba(46,196,182,0.6)",
                        boxShadow:
                          score >= 76
                            ? "0 0 8px rgba(61,220,151,0.6)"
                            : "0 0 6px rgba(46,196,182,0.4)",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* ── Weather micro-icon ── */}
              <div className="flex h-4 items-center justify-center mt-0.5">
                <WeatherMicro h={h} />
              </div>

              {/* ── Now indicator or time ── */}
              <div className="mt-0.5 flex flex-col items-center gap-0.5">
                {isNow ? (
                  <>
                    <span className="rounded-full bg-teal px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ink-950 shadow-[0_0_10px_rgba(46,196,182,0.5)]">
                      now
                    </span>
                    <p className="font-mono text-[10px] font-semibold leading-none text-teal tabular">
                      {formatTime(h.time)}
                    </p>
                  </>
                ) : (
                  <p className="font-mono text-[10px] leading-none text-mist-500/70 tabular">
                    {formatTime(h.time)}
                  </p>
                )}
              </div>

              {/* ── Wind speed ── */}
              {h.windKmh != null && (
                <p className="mt-0.5 text-[9px] text-mist-500/50 tabular">
                  {Math.round(h.windKmh)}<span className="text-[8px]">km/h</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom gradient fade for scroll hint */}
      <div className="pointer-events-none absolute right-0 top-6 bottom-0 w-10 bg-gradient-to-l from-ink-800 to-transparent rounded-r-xl" />
    </div>
  );
}
