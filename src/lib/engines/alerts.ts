import type { FishingAlert } from "../types";
import { formatTime } from "../format";
import { pressureDeltas, type PressureSeries } from "./pressure";

export function buildAlerts(opts: {
  ifNow: number | null;
  confidence: number;
  window: { from: string; to: string; peak: number } | null;
  pressure: PressureSeries;
  windNow: number | null;
  windPlus6: number | null;
  waterDelta24: number | null;
}): FishingAlert[] {
  const alerts: FishingAlert[] = [];

  if (opts.window && opts.window.peak >= 76) {
    alerts.push({
      id: "fenetre",
      kind: "fenetre",
      title: "Fenêtre favorable détectée",
      body: `${formatTime(opts.window.from)} → ${formatTime(opts.window.to)} · IF prévu ${opts.window.peak} · confiance ${opts.confidence} %`,
    });
  }

  const d = pressureDeltas(opts.pressure);
  if (d.d12 != null && d.d12 <= -4) {
    alerts.push({
      id: "pression",
      kind: "pression",
      title: "Chute de pression",
      body: `${d.d12.toFixed(1)} hPa en 12 h. Le modèle V1 traite une baisse progressive comme un signal, une chute brutale comme un régime instable.`,
    });
  }

  if (opts.windNow != null && opts.windPlus6 != null && Math.abs(opts.windPlus6 - opts.windNow) >= 15) {
    alerts.push({
      id: "vent",
      kind: "vent",
      title: "Changement de vent prévu",
      body: `Passage de ${Math.round(opts.windNow)} à ${Math.round(opts.windPlus6)} km/h d'ici 6 h.`,
    });
  }

  if (opts.waterDelta24 != null && Math.abs(opts.waterDelta24) >= 1.8) {
    alerts.push({
      id: "temperature",
      kind: "temperature",
      title: "Variation thermique de l'eau",
      body: `${opts.waterDelta24 > 0 ? "+" : ""}${opts.waterDelta24.toFixed(1)} °C estimés sur 24 h.`,
    });
  }

  if (opts.ifNow != null && opts.ifNow >= 91) {
    alerts.push({
      id: "exceptionnel",
      kind: "exceptionnel",
      title: "Conditions exceptionnelles (modèle)",
      body: `IF ${opts.ifNow}/100. Ce n'est pas une garantie de capture — uniquement un alignement des facteurs environnementaux V1.`,
    });
  }

  return alerts;
}
