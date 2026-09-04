import type { SnapshotOk } from "@/lib/services/snapshot";
import { formatTime } from "@/lib/format";
import { KindTag, Label, LevelBadge, scoreColor } from "./ui";

export function ScoreHero({ snap }: { snap: SnapshotOk }) {
  const score = snap.if.score;
  return (
    <div className="rounded-3xl border border-teal/25 bg-gradient-to-br from-ink-700 to-ink-900 p-6 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Label>Indice de frénésie</Label>
          <div className={`mt-2 font-mono text-7xl font-semibold tabular leading-none ${scoreColor(score)}`}>
            {score ?? "—"}
            <span className="ml-2 text-2xl text-mist-500">/ 100</span>
          </div>
          <p className={`mt-3 text-lg ${scoreColor(score)}`}>
            <LevelBadge level={snap.if.level} />
          </p>
        </div>
        <div className="space-y-3 text-right">
          <div>
            <p className="font-mono text-3xl tabular text-mist-100">{snap.if.confidence}%</p>
            <Label>Confiance</Label>
          </div>
          {snap.window && (
            <div>
              <p className={`font-mono text-xl tabular ${scoreColor(snap.window.peak)}`}>
                {formatTime(snap.window.from)}–{formatTime(snap.window.to)}
              </p>
              <Label>Prochain pic</Label>
            </div>
          )}
          <div className="flex justify-end">
            <KindTag kind="modèle v1" />
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-mist-500">
        Soleil {formatTime(snap.current.sunrise)} → {formatTime(snap.current.sunset)}
      </p>
      {score != null && snap.if.confidence < 60 && (
        <p className="mt-4 rounded-xl bg-signal-mid/10 px-3 py-2 text-sm text-signal-mid">
          Conditions théoriquement {score >= 61 ? "favorables" : "mitigées"}, mais confiance limitée
          ({snap.if.confidence} %). Peu d&apos;analogues historiques ou données estimées.
        </p>
      )}
    </div>
  );
}
