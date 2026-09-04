import { buildSnapshot } from "@/lib/services/snapshot";
import { HourlyTimeline } from "@/components/HourlyTimeline";
import { TrendChart } from "@/components/TrendChart";
import { Label, Panel, KindTag, scoreColor } from "@/components/ui";
import {
  cardinalFromDeg,
  cardinalLong,
  formatDate,
  formatTime,
} from "@/lib/format";
import { Zap, Droplets, Wind, Sun } from "lucide-react";

export const dynamic = "force-dynamic";

function ScoreBadge({ score }: { score: number | null }) {
  const base = "rounded-lg px-2.5 py-1 font-mono text-sm font-semibold tabular";
  if (score == null)
    return <span className={`${base} bg-white/5 text-mist-500`}>—</span>;
  if (score >= 76)
    return (
      <span className={`${base} bg-signal-good/15 text-signal-good`}>
        IF {score}
      </span>
    );
  if (score >= 61)
    return (
      <span className={`${base} bg-teal/15 text-teal`}>IF {score}</span>
    );
  if (score >= 41)
    return (
      <span className={`${base} bg-signal-mid/15 text-signal-mid`}>
        IF {score}
      </span>
    );
  return (
    <span className={`${base} bg-signal-bad/15 text-signal-bad`}>
      IF {score}
    </span>
  );
}

export default async function PrevisionPage() {
  const snap = await buildSnapshot();
  if (!snap.ok) {
    return (
      <Panel>
        <p className="text-signal-mid">Donnée indisponible</p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="anim-fade-in-up">
        <h1 className="text-2xl font-semibold">Prévision détaillée</h1>
        <p className="mt-1 text-sm text-mist-500">
          24 h · 48 h · 72 h · 7 jours — source Open-Meteo
        </p>
      </div>

      {/* Best window hero */}
      {snap.window && (
        <div className="anim-fade-in-up stagger-1 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
          <Zap className="h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className={`text-xl font-semibold font-mono tabular ${scoreColor(snap.window.peak)}`}>
              {formatTime(snap.window.from)} → {formatTime(snap.window.to)}
            </p>
            <p className="text-xs text-gold/80 font-semibold uppercase tracking-widest">
              Meilleur créneau · IF {snap.window.peak}
            </p>
          </div>
        </div>
      )}

      {/* 24h timeline */}
      <Panel className="anim-fade-in-up stagger-2">
        <Label>Timeline IF — 24 heures</Label>
        <p className="mt-1 text-xs text-mist-500">
          Barres colorées par score. ✦ = pic. Anneau = maintenant.
        </p>
        <div className="mt-3">
          <HourlyTimeline points={snap.hourly.slice(0, 24)} />
        </div>
      </Panel>

      {/* 72h trend charts */}
      <Panel className="anim-fade-in-up stagger-3">
        <Label>IF sur 72 heures</Label>
        <TrendChart points={snap.hourly} metric="ifScore" />
      </Panel>

      <Panel className="anim-fade-in-up stagger-4">
        <Label>Pression atmosphérique — 72 h</Label>
        <TrendChart points={snap.hourly} metric="pressureHpa" />
      </Panel>

      <Panel className="anim-fade-in-up stagger-5">
        <Label>Vent — 72 h</Label>
        <TrendChart points={snap.hourly} metric="windKmh" />
      </Panel>

      {/* 7-day table */}
      <Panel className="anim-fade-in-up stagger-6">
        <div className="flex items-center justify-between">
          <Label>7 jours</Label>
          <KindTag kind="prévision" />
        </div>

        <div className="mt-3 divide-y divide-white/5">
          {snap.daily.map((d, i) => {
            const hasRain = d.rain != null && d.rain > 0.5;
            const rainHeavy = d.rain != null && d.rain > 5;
            const windDir = cardinalLong(cardinalFromDeg(d.windDir));

            return (
              <div
                key={d.date}
                className={`anim-fade-in-up stagger-${Math.min(i + 1, 6)} flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3`}
              >
                {/* Date */}
                <span className="w-36 text-sm font-medium text-mist-300">
                  {formatDate(d.date)}
                </span>

                {/* Score badge */}
                <ScoreBadge score={d.ifScore ?? null} />

                {/* Temps */}
                <span className="font-mono text-sm tabular text-mist-400">
                  <Droplets className="mr-1 inline-block h-3.5 w-3.5 text-teal/60" />
                  {d.tMin ?? "—"}° / {d.tMax ?? "—"}°
                </span>

                {/* Pluie */}
                {hasRain && (
                  <span
                    className={`text-xs ${
                      rainHeavy ? "text-signal-bad" : "text-mist-500"
                    }`}
                  >
                    {rainHeavy ? "🌧" : "🌦"} {d.rain?.toFixed(1)} mm
                  </span>
                )}

                {/* Vent */}
                <span className="flex items-center gap-1 text-xs text-mist-500">
                  <Wind className="h-3.5 w-3.5" />
                  {d.windMax != null
                    ? `${Math.round(d.windMax)} km/h`
                    : "n/d"}{" "}
                  {windDir}
                </span>

                {/* Soleil */}
                <span className="ml-auto flex items-center gap-1 text-xs text-mist-500">
                  <Sun className="h-3.5 w-3.5 text-gold/60" />
                  {formatTime(d.sunrise)} – {formatTime(d.sunset)}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
