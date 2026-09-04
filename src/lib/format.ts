import type { Cardinal, FrenzyLevel, QualityLevel } from "./types";

const PARIS = "Europe/Paris";

export function nowParis(): Date {
  return new Date();
}

export function formatChartTick(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const weekday = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    weekday: "short",
  })
    .format(d)
    .replace(".", "");
  const hour = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    hour: "2-digit",
    hourCycle: "h23",
  })
    .format(d)
    .replace(/\D/g, "");
  return `${weekday} ${hour}h`;
}

export function formatWeekdayHour(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function minutesAgo(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((Date.now() - t) / 60000));
}

export function relativeUpdate(iso: string | null | undefined): string {
  const m = minutesAgo(iso);
  if (m === null) return "Horodatage inconnu";
  if (m < 1) return "à l'instant";
  if (m === 1) return "il y a 1 min";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  return h === 1 ? "il y a 1 h" : `il y a ${h} h`;
}

export function levelLabel(level: FrenzyLevel): string {
  switch (level) {
    case "TRES_MAUVAIS":
      return "TRÈS MAUVAIS";
    case "FAIBLE":
      return "FAIBLE";
    case "MOYEN":
      return "MOYEN";
    case "BON":
      return "BON";
    case "TRES_BON":
      return "TRÈS BON";
    case "EXCEPTIONNEL":
      return "EXCEPTIONNEL";
  }
}

export function qualityStars(q: QualityLevel): string {
  return "★".repeat(q) + "☆".repeat(5 - q);
}

export function qualityLabel(q: QualityLevel): string {
  return ["très faible", "faible", "moyenne", "bonne", "excellente"][q - 1];
}

export function kindLabel(kind: string): string {
  switch (kind) {
    case "mesure":
      return "MESURE";
    case "prevision":
      return "PRÉVISION";
    case "estimation":
      return "ESTIMATION";
    case "modele":
      return "MODÈLE";
    default:
      return kind.toUpperCase();
  }
}

export function cardinalFromDeg(deg: number | null | undefined): Cardinal | null {
  if (deg === null || deg === undefined || Number.isNaN(deg)) return null;
  const dirs: Cardinal[] = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const idx = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return dirs[idx];
}

export function cardinalLong(c: Cardinal | null): string {
  if (!c) return "—";
  const map: Record<Cardinal, string> = {
    N: "Nord",
    NE: "Nord-Est",
    E: "Est",
    SE: "Sud-Est",
    S: "Sud",
    SO: "Sud-Ouest",
    O: "Ouest",
    NO: "Nord-Ouest",
  };
  return map[c];
}

export function fmtNum(n: number | null | undefined, digits = 0, unit = ""): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "Donnée indisponible";
  const v = digits === 0 ? Math.round(n) : Number(n.toFixed(digits));
  return unit ? `${v} ${unit}` : String(v);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function hourInParis(iso: string): number {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  return Number(parts.find((p) => p.type === "hour")?.value ?? 0);
}

export function parisDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return parts;
}
