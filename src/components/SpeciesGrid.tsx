"use client";

import { useEffect, useRef, useState } from "react";
import { scoreColor } from "./ui";
import type { SnapshotOk } from "@/lib/services/snapshot";

const SPECIES_EMOJI: Record<string, string> = {
  brochet: "🐟",
  sandre: "🐠",
  perche: "🐡",
  "black-bass": "🎣",
  silure: "🦈",
  anguille: "🌊",
};

function AnimatedScore({
  score,
  delay = 0,
}: {
  score: number | null;
  delay?: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (score == null) return;
    const timer = setTimeout(() => {
      let startTs: number | null = null;
      const target = score;
      const duration = 950;

      function tick(ts: number) {
        if (!startTs) startTs = ts;
        const t = Math.min((ts - startTs) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setN(Math.round(ease * target));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  if (score == null) return <span className="text-mist-500">—</span>;
  return <span>{n}</span>;
}

function ScoreBar({
  score,
  delay = 0,
}: {
  score: number | null;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const color =
    score == null
      ? "#8b9bb0"
      : score >= 76
      ? "#3ddc97"
      : score >= 61
      ? "#2ec4b6"
      : score >= 41
      ? "#f5c542"
      : "#ff6b4a";

  useEffect(() => {
    const el = ref.current;
    if (!el || score == null) return;
    el.style.width = "0%";
    const id = setTimeout(() => {
      el.style.transition = `width 0.9s cubic-bezier(0.33, 1, 0.68, 1) ${delay + 200}ms`;
      el.style.width = `${score}%`;
    }, 60);
    return () => clearTimeout(id);
  }, [score, delay]);

  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
      <div
        ref={ref}
        className="h-full rounded-full"
        style={{ backgroundColor: color, width: "0%", boxShadow: `0 0 4px ${color}99` }}
      />
    </div>
  );
}

export function SpeciesGrid({ species }: { species: SnapshotOk["species"] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {species.map((s, i) => (
        <div
          key={s.id}
          className={`anim-fade-in-up stagger-${Math.min(i + 1, 6)} rounded-xl border border-white/8 bg-ink-700/80 px-3 py-3 transition-colors hover:border-white/15 hover:bg-ink-600/80`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs uppercase tracking-wider text-mist-500">{s.label}</p>
            <span className="text-base" role="img" aria-label={s.label}>
              {SPECIES_EMOJI[s.id] ?? "🐟"}
            </span>
          </div>
          <p className={`mt-1 font-mono text-2xl tabular font-semibold ${scoreColor(s.score)}`}>
            <AnimatedScore score={s.score} delay={i * 120} />
          </p>
          <ScoreBar score={s.score} delay={i * 120} />
          {s.calibrated && (
            <p className="mt-1 text-[10px] font-semibold text-gold">✦ calibré</p>
          )}
        </div>
      ))}
    </div>
  );
}
