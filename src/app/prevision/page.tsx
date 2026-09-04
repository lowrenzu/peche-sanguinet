import { buildSnapshot } from "@/lib/services/snapshot";
import { HourlyTimeline } from "@/components/HourlyTimeline";
import { TrendChart } from "@/components/TrendChart";
import { Label, Panel, KindTag, scoreColor } from "@/components/ui";
import { cardinalFromDeg, cardinalLong, formatDate, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

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
      <h1 className="text-2xl font-semibold">Prévision</h1>
      <p className="text-sm text-mist-500">24 h · 48 h · 72 h · 7 jours — source unique Open-Meteo.</p>

      <Panel>
        <Label>Timeline IF</Label>
        <div className="mt-3">
          <HourlyTimeline points={snap.hourly.slice(0, 24)} />
        </div>
      </Panel>

      <Panel>
        <Label>IF 72 h — maintenant et meilleures heures</Label>
        <TrendChart points={snap.hourly} metric="ifScore" />
      </Panel>
      <Panel>
        <Label>Pression 72 h</Label>
        <TrendChart points={snap.hourly} metric="pressureHpa" />
      </Panel>
      <Panel>
        <Label>Vent 72 h</Label>
        <TrendChart points={snap.hourly} metric="windKmh" />
      </Panel>

      <Panel>
        <div className="flex items-center justify-between">
          <Label>7 jours</Label>
          <KindTag kind="prévision" />
        </div>
        <div className="mt-3 divide-y divide-white/5">
          {snap.daily.map((d) => (
            <div key={d.date} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="w-40 text-mist-300">{formatDate(d.date)}</span>
              <span className={`font-mono tabular ${scoreColor(d.ifScore ?? null)}`}>
                IF {d.ifScore ?? "—"}
              </span>
              <span className="font-mono tabular">
                {d.tMin ?? "—"}° / {d.tMax ?? "—"}°
              </span>
              <span className="text-sm text-mist-500">
                {d.rain != null ? `${d.rain.toFixed(1)} mm` : "pluie n/d"} ·{" "}
                {d.windMax != null ? `${Math.round(d.windMax)} km/h` : "vent n/d"}{" "}
                {cardinalLong(cardinalFromDeg(d.windDir))}
              </span>
              <span className="text-xs text-mist-500">
                {formatTime(d.sunrise)} – {formatTime(d.sunset)}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {snap.window && (
        <Panel>
          <Label>Meilleur créneau</Label>
          <p className={`mt-2 text-xl ${scoreColor(snap.window.peak)}`}>
            {formatTime(snap.window.from)} → {formatTime(snap.window.to)} · IF {snap.window.peak}
          </p>
        </Panel>
      )}
    </div>
  );
}
