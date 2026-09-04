"use client";

import {
  Thermometer,
  Wind,
  Cloud,
  Gauge,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { SnapshotOk } from "@/lib/services/snapshot";
import { cardinalLong, fmtNum } from "@/lib/format";
import { KindTag, Label, Panel } from "./ui";
import { AnimatedBar } from "./AnimatedUI";

type CardDef = {
  k: string;
  v: string;
  s: string;
  tag: string;
  icon: React.ReactNode;
  pct: number;
  color: string;
};

export function ConditionCards({ snap }: { snap: SnapshotOk }) {
  const d12 = snap.current.pressureDeltas.d12;
  const sign = d12 != null ? (d12 > 0 ? "+" : "") : "";

  const pressureIcon =
    d12 == null ? (
      <Gauge className="h-4 w-4" />
    ) : d12 > 0.8 ? (
      <TrendingUp className="h-4 w-4" />
    ) : d12 < -0.8 ? (
      <TrendingDown className="h-4 w-4" />
    ) : (
      <Gauge className="h-4 w-4" />
    );

  /* Normalised 0–100% for each metric */
  const waterPct =
    snap.water.tempC != null
      ? Math.max(0, Math.min(100, ((snap.water.tempC - 10) / 22) * 100))
      : 0;
  const pressurePct =
    snap.current.pressureHpa != null
      ? Math.max(0, Math.min(100, ((snap.current.pressureHpa - 975) / 60) * 100))
      : 0;
  const windPct =
    snap.current.windKmh != null
      ? Math.max(0, Math.min(100, (snap.current.windKmh / 80) * 100))
      : 0;
  const cloudPct = Math.max(0, Math.min(100, snap.current.cloudPct ?? 0));

  const cards: CardDef[] = [
    {
      k: "Eau",
      v:
        snap.water.tempC != null
          ? `${snap.water.tempC.toFixed(1)} °C`
          : "Indisponible",
      s: `Δ24h ${snap.water.delta24h > 0 ? "+" : ""}${snap.water.delta24h} °C · anomalie ${snap.water.anomaly > 0 ? "+" : ""}${snap.water.anomaly}`,
      tag: snap.water.kind,
      icon: <Thermometer className="h-4 w-4" />,
      pct: waterPct,
      color: "#2ec4b6",
    },
    {
      k: "Pression",
      v: fmtNum(snap.current.pressureHpa, 0, "hPa"),
      s:
        d12 != null
          ? `${sign}${d12.toFixed(1)} hPa / 12 h`
          : "Variation indisponible",
      tag: "prévision",
      icon: pressureIcon,
      pct: pressurePct,
      color: "#d4a853",
    },
    {
      k: "Vent",
      v: fmtNum(snap.current.windKmh, 0, "km/h"),
      s: `${cardinalLong(snap.current.windCardinal)}${
        snap.current.windGustKmh != null
          ? ` · rafales ${Math.round(snap.current.windGustKmh)}`
          : ""
      }`,
      tag: "mesure modèle",
      icon: <Wind className="h-4 w-4" />,
      pct: windPct,
      color: "#8b9bb0",
    },
    {
      k: "Nuages",
      v: fmtNum(snap.current.cloudPct, 0, "%"),
      s:
        snap.current.precipMm != null && snap.current.precipMm > 0
          ? `${snap.current.precipMm.toFixed(1)} mm de précip.`
          : "Précipitations nulles ou faibles",
      tag: "prévision",
      icon: <Cloud className="h-4 w-4" />,
      pct: cloudPct,
      color: "#8b9bb0",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => (
        <Panel
          key={c.k}
          className={`anim-fade-in-up stagger-${i + 1} hover:border-white/20 transition-colors`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-teal opacity-80">{c.icon}</span>
              <Label>{c.k}</Label>
            </div>
            <KindTag kind={c.tag} />
          </div>
          <p className="mt-2 font-mono text-2xl tabular text-mist-100">{c.v}</p>
          <AnimatedBar pct={c.pct} color={c.color} delay={i * 100} />
          <p className="mt-1.5 text-xs text-mist-500">{c.s}</p>
        </Panel>
      ))}
    </div>
  );
}
