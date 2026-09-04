import { buildSnapshot } from "@/lib/services/snapshot";
import { WhyPanel } from "@/components/WhyPanel";
import { KindTag, Label, Panel, scoreColor } from "@/components/ui";
import { qualityLabel, qualityStars } from "@/lib/format";
import { historicalQuality, waterQuality, freshnessQuality } from "@/lib/quality";

export const dynamic = "force-dynamic";

export default async function AnalysePage() {
  const snap = await buildSnapshot();
  if (!snap.ok) {
    return (
      <Panel>
        <p className="text-signal-mid">Donnée indisponible</p>
      </Panel>
    );
  }

  const wq = waterQuality(snap.water.kind === "mesure" ? "mesure" : "estimation", snap.water.measured);
  const hq = historicalQuality(snap.analogCount, 365);
  const fq = freshnessQuality(snap.source.fetchedAt, snap.source.stale);
  const stats = snap.localStats;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analyse</h1>
      <p className="text-sm text-mist-500">
        Transparence du modèle, qualité des sources, et statistique locale dès que le journal le permet.
      </p>
      <WhyPanel snap={snap} />

      <Panel>
        <Label>Statistique locale Sanguinet</Label>
        <p className="mt-2 text-sm text-mist-300">
          {stats.n} capture{stats.n > 1 ? "s" : ""}. {stats.alignment.note}
        </p>
        {stats.meanIfAtCatch != null && (
          <p className="mt-1 font-mono text-lg tabular">IF moyen à la prise : {stats.meanIfAtCatch.toFixed(0)}</p>
        )}
        {stats.bestHours.length > 0 && (
          <p className="mt-2 text-sm text-mist-300">
            Heures les plus représentées :{" "}
            {stats.bestHours.map((h) => `${String(h.h).padStart(2, "0")}h (${h.n})`).join(" · ")}
          </p>
        )}
        <div className="mt-3 flex h-16 items-end gap-1">
          {stats.byHour.map((n, h) => (
            <div
              key={h}
              title={`${h}h : ${n}`}
              className="flex-1 rounded-t bg-teal/70"
              style={{ height: `${4 + n * 10}px` }}
            />
          ))}
        </div>
        {!stats.ready && (
          <p className="mt-3 text-xs text-mist-500">
            En dessous de 5 prises, pas d&apos;inférence statistique. Machine learning : pas avant un volume local réel.
          </p>
        )}
      </Panel>

      <Panel>
        <Label>Pondérations configurées</Label>
        <ul className="mt-3 font-mono text-sm tabular">
          {Object.entries(snap.if.configuredWeights).map(([k, v]) => (
            <li key={k} className="flex justify-between py-1">
              <span className="capitalize text-mist-500">{k}</span>
              <span>{Math.round(v * 100)} %</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-mist-500">
          Coefficients V1, configurables dans Admin. Pas scientifiquement définitifs.
        </p>
      </Panel>
      <Panel>
        <Label>Qualité des données</Label>
        <div className="mt-3 space-y-2 text-sm">
          <p>
            Météo {qualityStars(fq)} {qualityLabel(fq)} — {snap.source.weather}
          </p>
          <p>
            Eau {qualityStars(wq)} {qualityLabel(wq)} — {snap.water.kind}
          </p>
          <p>
            Historique {qualityStars(hq)} {qualityLabel(hq)} — {snap.analogCount} analogues
          </p>
        </div>
      </Panel>
      <Panel>
        <div className="flex items-center justify-between">
          <Label>Espèces</Label>
          <KindTag kind="indicatif / local" />
        </div>
        <div className="mt-3 space-y-2">
          {snap.species.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between">
                <span>
                  {s.label} {s.calibrated ? "· calibré" : ""}
                </span>
                <span className={`font-mono ${scoreColor(s.score)}`}>{s.score ?? "—"}</span>
              </div>
              <p className="text-xs text-mist-500">{s.note}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
