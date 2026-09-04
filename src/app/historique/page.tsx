import { buildSnapshot } from "@/lib/services/snapshot";
import { loadArchive, archiveToClimate } from "@/lib/providers/openMeteo";
import { TrendChart } from "@/components/TrendChart";
import { KindTag, Label, Panel } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HistoriquePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { range = "7j", from, to } = await searchParams;
  const snap = await buildSnapshot();
  let archiveError: string | null = null;
  let days: ReturnType<typeof archiveToClimate> = [];
  try {
    const years = range === "5ans" || Boolean(from) ? 5 : 1;
    const pack = await loadArchive(years);
    days = archiveToClimate(pack.data);
  } catch (e) {
    archiveError = e instanceof Error ? e.message : "Donnée indisponible";
  }

  const cut =
    range === "24h"
      ? 1
      : range === "7j"
        ? 7
        : range === "30j"
          ? 30
          : range === "1an"
            ? 365
            : 365 * 5;
  const recent = from && to ? days.filter((d) => d.date >= from && d.date <= to) : days.slice(-cut);

  const links = [
    ["24h", "24 h"],
    ["7j", "7 jours"],
    ["30j", "30 jours"],
    ["1an", "1 an"],
    ["5ans", "5 ans"],
  ] as const;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Historique Sanguinet</h1>
      <div className="flex flex-wrap gap-2">
        {links.map(([id, label]) => (
          <a
            key={id}
            href={`/historique?range=${id}`}
            className={`rounded-lg px-3 py-2 text-sm ${range === id && !from ? "bg-teal text-ink-950" : "bg-ink-700"}`}
          >
            {label}
          </a>
        ))}
      </div>
      <form className="flex flex-wrap items-end gap-2" action="/historique">
        <input type="hidden" name="range" value="custom" />
        <label className="text-xs text-mist-500">
          Du
          <input name="from" type="date" defaultValue={from} className="field mt-1" />
        </label>
        <label className="text-xs text-mist-500">
          Au
          <input name="to" type="date" defaultValue={to} className="field mt-1" />
        </label>
        <button className="rounded-lg bg-ink-700 px-3 py-2 text-sm">Période</button>
      </form>

      {from && to ? (
        archiveError ? (
          <Panel>
            <p className="text-signal-mid">Archive indisponible</p>
          </Panel>
        ) : (
          <Panel>
            <Label>Période personnalisée ERA5</Label>
            <p className="mt-1 text-xs text-mist-500">
              {from} → {to} · {recent.length} jours
            </p>
            <div className="mt-3 max-h-96 overflow-auto text-sm">
              <table className="w-full">
                <thead className="text-left text-mist-500">
                  <tr>
                    <th className="py-1">Date</th>
                    <th>Air °C</th>
                    <th>hPa</th>
                    <th>Vent</th>
                    <th>Nuages</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.slice(-200).map((d) => (
                    <tr key={d.date} className="border-t border-white/5 font-mono tabular">
                      <td className="py-1">{formatDate(d.date)}</td>
                      <td>{d.airTempC?.toFixed(1) ?? "—"}</td>
                      <td>{d.pressureHpa?.toFixed(0) ?? "—"}</td>
                      <td>{d.windKmh?.toFixed(0) ?? "—"}</td>
                      <td>{d.cloudPct?.toFixed(0) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )
      ) : range === "24h" || range === "7j" ? (
        snap.ok ? (
          <>
            <Panel>
              <Label>IF récent</Label>
              <TrendChart points={snap.hourlyAll.slice(range === "24h" ? -24 : -48)} />
            </Panel>
            <Panel>
              <Label>Eau estimée</Label>
              <TrendChart
                points={snap.hourlyAll.slice(range === "24h" ? -24 : -48)}
                metric="waterTempC"
              />
            </Panel>
          </>
        ) : (
          <Panel>
            <p className="text-signal-mid">Donnée indisponible</p>
          </Panel>
        )
      ) : archiveError ? (
        <Panel>
          <p className="text-signal-mid">Archive indisponible</p>
          <p className="text-sm text-mist-500">{archiveError}</p>
        </Panel>
      ) : (
        <Panel>
          <div className="flex items-center justify-between">
            <Label>Température de l&apos;air — archive ERA5</Label>
            <KindTag kind="mesure réanalyse" />
          </div>
          <div className="mt-3 max-h-96 overflow-auto text-sm">
            <table className="w-full">
              <thead className="text-left text-mist-500">
                <tr>
                  <th className="py-1">Date</th>
                  <th>Air °C</th>
                  <th>hPa</th>
                  <th>Vent</th>
                  <th>Nuages</th>
                </tr>
              </thead>
              <tbody>
                {recent.slice(-120).map((d) => (
                  <tr key={d.date} className="border-t border-white/5 font-mono tabular">
                    <td className="py-1">{formatDate(d.date)}</td>
                    <td>{d.airTempC?.toFixed(1) ?? "—"}</td>
                    <td>{d.pressureHpa?.toFixed(0) ?? "—"}</td>
                    <td>{d.windKmh?.toFixed(0) ?? "—"}</td>
                    <td>{d.cloudPct?.toFixed(0) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {snap.ok && (
        <Panel>
          <Label>Matching historique</Label>
          <p className="mt-2 text-mist-300">
            {snap.analogCount} journées météo similaires. Similarité météorologique uniquement
            {snap.catchRateOnAnalogs.rate == null
              ? " — pas de statistique de capture."
              : ` — ${snap.catchRateOnAnalogs.rate} % des analogues avec journal ont une prise.`}
          </p>
          <ul className="mt-3 space-y-1 text-sm font-mono tabular">
            {snap.analogs.slice(0, 8).map((a) => (
              <li key={a.date} className="flex justify-between text-mist-300">
                <span>{a.date}</span>
                <span>d={a.distance}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
