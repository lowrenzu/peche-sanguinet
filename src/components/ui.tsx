import { levelLabel } from "@/lib/format";
import type { FrenzyLevel } from "@/lib/types";

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-ink-800/80 p-4 shadow-panel ${className}`}>
      {children}
    </section>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">{children}</p>
  );
}

export function scoreColor(score: number | null): string {
  if (score == null) return "text-mist-500";
  if (score >= 76) return "text-signal-good";
  if (score >= 61) return "text-teal";
  if (score >= 41) return "text-signal-mid";
  return "text-signal-bad";
}

export function scoreBg(score: number | null): string {
  if (score == null) return "bg-white/5";
  if (score >= 76) return "bg-signal-good/15";
  if (score >= 61) return "bg-teal/15";
  if (score >= 41) return "bg-signal-mid/15";
  return "bg-signal-bad/15";
}

export function LevelBadge({ level }: { level: FrenzyLevel | null }) {
  if (!level) return <span className="text-mist-500">Indice indisponible</span>;
  return <span className="font-semibold tracking-widest">{levelLabel(level)}</span>;
}

export function Stamp({ text }: { text: string }) {
  return <p className="text-xs text-mist-500">{text}</p>;
}

export function KindTag({ kind }: { kind: string }) {
  return (
    <span className="rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
      {kind}
    </span>
  );
}
