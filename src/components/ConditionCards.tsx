import type { SnapshotOk } from "@/lib/services/snapshot";
import { cardinalLong, fmtNum } from "@/lib/format";
import { KindTag, Label, Panel } from "./ui";

export function ConditionCards({ snap }: { snap: SnapshotOk }) {
  const d12 = snap.current.pressureDeltas.d12;
  const sign = d12 != null ? (d12 > 0 ? "+" : "") : "";
  const cards = [
    {
      k: "Eau",
      v: snap.water.tempC != null ? `${snap.water.tempC.toFixed(1)} °C` : "Donnée indisponible",
      s: `Δ24h ${snap.water.delta24h > 0 ? "+" : ""}${snap.water.delta24h} °C · anomalie ${snap.water.anomaly > 0 ? "+" : ""}${snap.water.anomaly}`,
      tag: snap.water.kind,
    },
    {
      k: "Pression",
      v: fmtNum(snap.current.pressureHpa, 0, "hPa"),
      s: d12 != null ? `${sign}${d12.toFixed(1)} hPa / 12h` : "Variation indisponible",
      tag: "prévision",
    },
    {
      k: "Vent",
      v: fmtNum(snap.current.windKmh, 0, "km/h"),
      s: `${cardinalLong(snap.current.windCardinal)}${snap.current.windGustKmh != null ? ` · rafales ${Math.round(snap.current.windGustKmh)}` : ""}`,
      tag: "mesure modèle",
    },
    {
      k: "Nuages",
      v: fmtNum(snap.current.cloudPct, 0, "%"),
      s:
        snap.current.precipMm != null && snap.current.precipMm > 0
          ? `${snap.current.precipMm.toFixed(1)} mm`
          : "Précipitations nulles ou faibles",
      tag: "prévision",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <Panel key={c.k}>
          <div className="flex items-start justify-between gap-2">
            <Label>{c.k}</Label>
            <KindTag kind={c.tag} />
          </div>
          <p className="mt-2 font-mono text-2xl tabular text-mist-100">{c.v}</p>
          <p className="mt-1 text-xs text-mist-500">{c.s}</p>
        </Panel>
      ))}
    </div>
  );
}
