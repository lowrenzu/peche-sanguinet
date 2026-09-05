import { buildSnapshot } from "@/lib/services/snapshot";
import { ScoreHero } from "@/components/ScoreHero";
import { ConditionCards } from "@/components/ConditionCards";
import { HourlyTimeline } from "@/components/HourlyTimeline";
import { TrendChart } from "@/components/TrendChart";
import { WhyPanel } from "@/components/WhyPanel";
import { GoFishing } from "@/components/GoFishing";
import { RefreshButton } from "@/components/RefreshButton";
import { AlertNotify } from "@/components/AlertNotify";
import { SpeciesGrid } from "@/components/SpeciesGrid";
import { KindTag, Label, Panel, Stamp, scoreColor } from "@/components/ui";
import { formatTime, relativeUpdate } from "@/lib/format";
import Link from "next/link";
import { Activity, Map, BookOpen } from "lucide-react";

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
          Aucune valeur n&apos;a été inventée. Réessayez — le cache affichera
          les dernières données valides dès qu&apos;une requête aura réussi.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Page header ── */}
      <div className="anim-fade-in-up flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-mist-500">
            Conditions en temps réel sur le lac.
          </p>
          <h1 className="text-2xl font-semibold">
            Tableau de bord{" "}
            <span className="text-teal">{snap.sector.name}</span>
          </h1>
          {!snap.sector.primary && (
            <p className="text-xs text-gold">
              Territoire d&apos;extension — modèle non calibré localement.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Stamp
            text={
              snap.source.stale
                ? `Dernières données : ${relativeUpdate(snap.source.fetchedAt)}`
                : `Mis à jour ${relativeUpdate(snap.source.fetchedAt)}`
            }
          />
        </div>
      </div>

      {/* ── Alerts ── */}
      <AlertNotify alerts={snap.alerts} enabled={snap.config.notifications} />
      {snap.alerts.map((a) => (
        <div
          key={a.id}
          className="anim-fade-in-up rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3"
        >
          <p className="font-semibold text-gold">{a.title}</p>
          <p className="text-sm text-mist-300">{a.body}</p>
        </div>
      ))}

      {/* ── Hero score ── */}
      <ScoreHero snap={snap} />

      {/* ── Go fishing CTA ── */}
      <GoFishing />

      {/* ── Condition cards ── */}
      <ConditionCards snap={snap} />

      {/* ── Hourly timeline ── */}
      <div className="anim-fade-in-up space-y-0">
        {/* Header with stats summary */}
        <div className="rounded-t-2xl border border-b-0 border-white/10 bg-ink-800/90 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-mist-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal/15">
                  <Activity className="h-4 w-4 text-teal" />
                </span>
                Les 24 prochaines heures
              </h2>
              <p className="mt-1 text-xs text-mist-500">
                Évolution horaire de l&apos;indice de frénésie avec conditions météo.
              </p>
            </div>
            <KindTag kind="modèle" />
          </div>

          {/* Quick stats row */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {snap.window && (
              <div className="flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/10 px-3 py-1.5">
                <span className="text-xs font-semibold text-gold">⚡ Pic</span>
                <span className={`font-mono text-sm font-bold tabular ${scoreColor(snap.window.peak)}`}>
                  IF {snap.window.peak}
                </span>
                <span className="text-xs text-gold/70">
                  {formatTime(snap.window.from)}–{formatTime(snap.window.to)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-3 py-1.5">
              <span className="text-xs text-mist-500">Moy.</span>
              <span className={`font-mono text-sm font-semibold tabular ${scoreColor(
                Math.round(
                  snap.hourly.slice(0, 24).reduce((s, h) => s + (h.ifScore ?? 0), 0) /
                    Math.max(1, snap.hourly.slice(0, 24).filter((h) => h.ifScore != null).length)
                )
              )}`}>
                IF{" "}
                {Math.round(
                  snap.hourly.slice(0, 24).reduce((s, h) => s + (h.ifScore ?? 0), 0) /
                    Math.max(1, snap.hourly.slice(0, 24).filter((h) => h.ifScore != null).length)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Chart area */}
        <div className="rounded-b-2xl border border-t-0 border-white/10 bg-ink-900/70 px-4 py-4">
          <HourlyTimeline points={snap.hourly.slice(0, 24)} />
        </div>
      </div>

      {/* ── 72h trend ── */}
      <Panel className="anim-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Tendance 72 heures</Label>
          <KindTag kind="maintenant + pics" />
        </div>
        <p className="mb-2 mt-1 text-xs text-mist-500">
          Trait blanc = heure actuelle · Bandes or = meilleures heures selon
          l&apos;IF.
        </p>
        <TrendChart points={snap.hourly} />
      </Panel>

      {/* ── Why panel ── */}
      <WhyPanel snap={snap} />

      {/* ── Missing data ── */}
      {snap.missing.length > 0 && (
        <Panel className="anim-fade-in-up">
          <Label>Données manquantes</Label>
          <p className="mt-2 text-sm text-mist-300">
            {snap.missing.join(" · ")}
          </p>
        </Panel>
      )}

      {/* ── Local stats ── */}
      {snap.localStats.n > 0 && (
        <Panel className="anim-fade-in-up">
          <Label>Ce que vos captures permettent d&apos;apprendre</Label>
          <p className="mt-2 text-sm text-mist-300">
            {snap.localStats.n} prise{snap.localStats.n > 1 ? "s" : ""} dans
            le journal. {snap.localStats.alignment.note}
          </p>
          <Link
            href="/analyse"
            className="mt-2 inline-flex items-center gap-1 text-sm text-teal hover:underline"
          >
            Voir l&apos;analyse locale →
          </Link>
        </Panel>
      )}

      {/* ── Species grid ── */}
      <Panel className="anim-fade-in-up">
        <div className="flex items-center justify-between gap-2">
          <Label>Par espèce — indicatif V1</Label>
          <KindTag kind="modèle" />
        </div>
        <p className="mt-1 text-xs text-mist-500">{snap.speciesDisclaimer}</p>
        <SpeciesGrid species={snap.species} />
      </Panel>

      {/* ── Quick nav links ── */}
      <div className="anim-fade-in-up flex flex-wrap gap-2 text-sm">
        <Link
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-700 px-4 py-2.5 text-mist-100 transition-colors hover:border-teal/30 hover:bg-ink-600"
          href="/prevision"
        >
          <Activity className="h-4 w-4 text-teal" />
          Prévision détaillée
        </Link>
        <Link
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-700 px-4 py-2.5 text-mist-100 transition-colors hover:border-teal/30 hover:bg-ink-600"
          href="/carte"
        >
          <Map className="h-4 w-4 text-teal" />
          Carte du lac
        </Link>
        <Link
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-700 px-4 py-2.5 text-mist-100 transition-colors hover:border-teal/30 hover:bg-ink-600"
          href="/sources"
        >
          <BookOpen className="h-4 w-4 text-teal" />
          Sources &amp; méthodologie
        </Link>
      </div>
    </div>
  );
}
