import type { SnapshotOk } from "@/lib/services/snapshot";
import { Label, Panel } from "./ui";

export function WhyPanel({ snap }: { snap: SnapshotOk }) {
  const impact = [...snap.if.factors].sort((a, b) => b.points - a.points)[0];
  return (
    <Panel>
      <Label>Pourquoi ?</Label>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mist-300">
        {snap.if.why.map((line) => (
          <li key={line} className="border-l-2 border-teal/40 pl-3">
            {line}
          </li>
        ))}
      </ul>
      {impact && (
        <p className="mt-4 text-xs text-mist-500">
          Plus fort impact sur le total : {impact.label} (+{impact.points} / {impact.maxPoints})
        </p>
      )}
      <div className="mt-4 space-y-2 font-mono text-sm tabular">
        {snap.if.factors.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-3">
            <span className="text-mist-500">{f.label}</span>
            <span className={f.available ? "text-mist-100" : "text-signal-mid"}>
              {f.available ? `+${f.points}` : "indisponible"}
            </span>
          </div>
        ))}
        <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
          <span>TOTAL</span>
          <span>{snap.if.score ?? "—"}</span>
        </div>
      </div>
    </Panel>
  );
}
