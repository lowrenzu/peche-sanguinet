"use client";

import type { SnapshotOk } from "@/lib/services/snapshot";
import { formatTime } from "@/lib/format";
import { KindTag, Label, LevelBadge, scoreColor } from "./ui";
import { AnimatedNumber, ProgressRing } from "./AnimatedUI";
import { Fish, Sun, Zap } from "lucide-react";

function scoreGlowClass(score: number | null): string {
  if (score == null) return "";
  if (score >= 76) return "score-glow-good";
  if (score >= 61) return "score-glow-teal";
  if (score >= 41) return "score-glow-mid";
  return "score-glow-bad";
}

function ambientStyle(score: number | null): React.CSSProperties {
  if (score == null) return {};
  if (score >= 76)
    return { background: "radial-gradient(circle at center, rgba(61,220,151,0.22) 0%, transparent 70%)" };
  if (score >= 61)
    return { background: "radial-gradient(circle at center, rgba(46,196,182,0.18) 0%, transparent 70%)" };
  if (score >= 41)
    return { background: "radial-gradient(circle at center, rgba(245,197,66,0.16) 0%, transparent 70%)" };
  return { background: "radial-gradient(circle at center, rgba(255,107,74,0.16) 0%, transparent 70%)" };
}

export function ScoreHero({ snap }: { snap: SnapshotOk }) {
  const score = snap.if.score;

  return (
    <div className="anim-fade-in-up relative overflow-hidden rounded-3xl border border-teal/20 bg-gradient-to-br from-ink-700/90 to-ink-900 p-5 shadow-panel sm:p-6">
      {/* Ambient colour blob */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl"
        style={ambientStyle(score)}
      />

      <div className="relative flex flex-wrap items-start gap-5">
        {/* ── Left: radial gauge ── */}
        <div className="flex flex-col items-center gap-2">
          {/* Title row */}
          <div className="flex items-center gap-2 self-start">
            <span className="anim-wave inline-block text-teal">
              <Fish className="h-4 w-4" />
            </span>
            <Label>Indice de frénésie</Label>
          </div>

          {/* Ring */}
          <ProgressRing score={score} size={156} sw={12}>
            <div className="flex flex-col items-center gap-0.5">
              <p
                className={`font-mono text-5xl font-semibold tabular leading-none ${scoreColor(score)} ${scoreGlowClass(score)}`}
              >
                <AnimatedNumber value={score} duration={1200} />
              </p>
              <p className="text-xs text-mist-500">/ 100</p>
            </div>
          </ProgressRing>

          {/* Level label */}
          <p className={`text-base font-semibold tracking-wide ${scoreColor(score)}`}>
            <LevelBadge level={snap.if.level} />
          </p>
        </div>

        {/* ── Right: stats ── */}
        <div className="flex flex-1 flex-col gap-3 pt-1">
          <div className="flex justify-end">
            <KindTag kind="modèle v1" />
          </div>

          {/* Confiance */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p
              className={`font-mono text-3xl font-semibold tabular leading-tight ${
                snap.if.confidence >= 70 ? "text-mist-100" : "text-signal-mid"
              }`}
            >
              <AnimatedNumber value={snap.if.confidence} duration={950} />%
            </p>
            <Label>Confiance modèle</Label>
          </div>

          {/* Best window */}
          {snap.window ? (
            <div className="rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-right">
              <p className={`font-mono text-xl font-semibold tabular ${scoreColor(snap.window.peak)}`}>
                {formatTime(snap.window.from)}–{formatTime(snap.window.to)}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                <Zap className="mr-1 inline-block h-3 w-3" />
                Pic · IF {snap.window.peak}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-right">
              <p className="text-sm text-mist-500">Créneau indisponible</p>
            </div>
          )}

          {/* Sunrise / sunset */}
          <div className="flex items-center gap-3 text-sm text-mist-500">
            <span className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-gold/80" />
              {formatTime(snap.current.sunrise)}
            </span>
            <span className="text-white/20">—</span>
            <span className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-mist-500/60" />
              {formatTime(snap.current.sunset)}
            </span>
          </div>
        </div>
      </div>

      {/* Low-confidence notice */}
      {score != null && snap.if.confidence < 60 && (
        <p className="mt-4 rounded-xl border border-signal-mid/20 bg-signal-mid/10 px-3 py-2 text-sm text-signal-mid">
          Conditions théoriquement {score >= 61 ? "favorables" : "mitigées"}, mais confiance
          limitée ({snap.if.confidence}&thinsp;%). Peu d&apos;analogues historiques ou données
          estimées.
        </p>
      )}
    </div>
  );
}
