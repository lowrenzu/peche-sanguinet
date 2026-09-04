"use client";

import type { SnapshotOk } from "@/lib/services/snapshot";
import { Label, Panel } from "./ui";
import { AnimatedBar, AnimatedNumber } from "./AnimatedUI";

export function WhyPanel({ snap }: { snap: SnapshotOk }) {
  const sorted = [...snap.if.factors].sort((a, b) => b.points - a.points);
  const topImpact = sorted[0];

  return (
    <Panel>
      <Label>Pourquoi ce score ?</Label>

      {/* Why bullets */}
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mist-300">
        {snap.if.why.map((line) => (
          <li key={line} className="border-l-2 border-teal/40 pl-3">
            {line}
          </li>
        ))}
      </ul>

      {topImpact && (
        <p className="mt-3 text-xs text-mist-500">
          Plus fort impact :{" "}
          <span className="text-mist-300">{topImpact.label}</span>{" "}
          (+{topImpact.points} / {topImpact.maxPoints})
        </p>
      )}

      {/* Factor bars */}
      <div className="mt-5 space-y-3.5">
        {snap.if.factors.map((f, i) => {
          const pct =
            f.available && f.maxPoints > 0
              ? (f.points / f.maxPoints) * 100
              : 0;

          const barColor = !f.available
            ? "#f5c542"
            : f.points >= f.maxPoints * 0.7
            ? "#3ddc97"
            : f.points > 0
            ? "#2ec4b6"
            : "#8b9bb0";

          return (
            <div key={f.id} className={`anim-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-mist-400">{f.label}</span>
                <span
                  className={`font-mono tabular ${
                    f.available ? "text-mist-100" : "text-signal-mid text-xs"
                  }`}
                >
                  {f.available ? `+${f.points}` : "n/d"}
                </span>
              </div>
              <AnimatedBar pct={pct} color={barColor} delay={i * 85} height={5} />
            </div>
          );
        })}
      </div>

      {/* Total row */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-white/12 bg-white/5 px-4 py-3">
        <span className="text-sm font-semibold uppercase tracking-wider text-mist-400">
          Total
        </span>
        <span className="font-mono text-2xl font-bold tabular text-mist-100">
          <AnimatedNumber value={snap.if.score} duration={1100} />
        </span>
      </div>
    </Panel>
  );
}
