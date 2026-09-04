import { buildSnapshot } from "@/lib/services/snapshot";
import { ScoreHero } from "@/components/ScoreHero";
import { ConditionCards } from "@/components/ConditionCards";
import { HourlyTimeline } from "@/components/HourlyTimeline";
import { TrendChart } from "@/components/TrendChart";
import { WhyPanel } from "@/components/WhyPanel";
import { GoFishing } from "@/components/GoFishing";
import { RefreshButton } from "@/components/RefreshButton";
import { AlertNotify } from "@/components/AlertNotify";
import { KindTag, Label, Panel, Stamp, scoreColor } from "@/components/ui";
import { formatTime, relativeUpdate } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snap = await buildSnapshot();

  if (!snap.ok) {
    return (
      <Panel>
        <Label>Données</Label>
        <p className="mt-3 text-lg text-signal-mid">Donnée indisponible</p>
        <p className="mt-2 text-sm text-mist-500">{snap.error}</p>
        <p className="mt-4 text-sm text-mist-300">
          Aucune valeur n&apos;a été inventée. Réessayez — le cache affichera les dernières données valides dès
          qu&apos;une requête aura réussi.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-mist-500">Voici ce qui se passe actuellement sur le lac.</p>
          <h1 className="text-2xl font-semibold">Tableau de bord {snap.sector.name}</h1>
          {!snap.sector.primary && (
            <p className="text-xs text-gold">Territoire d&apos;extension — modèle non calibré localement.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Stamp
            text={
              snap.source.stale
                ? `Dernières données disponibles : ${relativeUpdate(snap.source.fetchedAt)}`
                : `Données mises à jour ${relativeUpdate(snap.source.fetchedAt)}`
            }
          />
        </div>
      </div>

      <AlertNotify alerts={snap.alerts} enabled={snap.config.notifications} />
      {snap.alerts.map((a) => (
        <div key={a.id} className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
          <p className="font-semibold text-gold">{a.title}</p>
          <p className="text-sm text-mist-300">{a.body}</p>
        </div>
      ))}

      <ScoreHero snap={snap} />
      <GoFishing />
      <ConditionCards snap={snap} />

      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <Label>Les 24 prochaines heures</Label>
            <p className="mt-1 text-sm text-mist-500">
              Anneau blanc = maintenant. Or = pic.{" "}
              {snap.window
                ? `Meilleure fenêtre ${formatTime(snap.window.from)}–${formatTime(snap.window.to)} (IF ${snap.window.peak}).`
                : "Créneau indisponible."}
            </p>
          </div>
          <KindTag kind="modèle" />
        </div>
        <div className="mt-4">
          <HourlyTimeline points={snap.hourly.slice(0, 24)} />
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Tendance 72 heures</Label>
          <KindTag kind="maintenant + pics" />
        </div>
        <p className="mb-2 mt-1 text-sm text-mist-500">
          Trait blanc = heure actuelle. Bandes or = meilleures heures pour pêcher selon l&apos;IF.
        </p>
        <TrendChart points={snap.hourly} />
      </Panel>

      <WhyPanel snap={snap} />

      {snap.missing.length > 0 && (
        <Panel>
          <Label>Données manquantes</Label>
          <p className="mt-2 text-sm text-mist-300">{snap.missing.join(" · ")}</p>
        </Panel>
      )}

      {snap.localStats.n > 0 && (
        <Panel>
          <Label>Ce que vos captures permettent d&apos;apprendre</Label>
          <p className="mt-2 text-sm text-mist-300">
            {snap.localStats.n} prise{snap.localStats.n > 1 ? "s" : ""} dans le journal.{" "}
            {snap.localStats.alignment.note}
          </p>
          <Link href="/analyse" className="mt-2 inline-block text-sm text-teal">
            Voir l&apos;analyse locale
          </Link>
        </Panel>
      )}

      <Panel>
        <Label>Par espèce — indicatif V1</Label>
        <p className="mt-1 text-xs text-mist-500">{snap.speciesDisclaimer}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {snap.species.map((s) => (
            <div key={s.id} className="rounded-xl bg-ink-700 px-3 py-3">
              <p className="text-xs uppercase tracking-wider text-mist-500">{s.label}</p>
              <p className={`font-mono text-2xl tabular ${scoreColor(s.score)}`}>{s.score ?? "—"}</p>
              {s.calibrated && <p className="text-[10px] text-gold">calibré</p>}
            </div>
          ))}
        </div>
      </Panel>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link className="rounded-lg bg-ink-700 px-3 py-2" href="/prevision">
          Prévision détaillée
        </Link>
        <Link className="rounded-lg bg-ink-700 px-3 py-2" href="/carte">
          Carte du lac
        </Link>
        <Link className="rounded-lg bg-ink-700 px-3 py-2" href="/sources">
          Sources & méthodologie
        </Link>
      </div>
    </div>
  );
}
