export type DataKind = "mesure" | "prevision" | "estimation" | "modele";

export type QualityLevel = 1 | 2 | 3 | 4 | 5;

export type Cardinal = "N" | "NE" | "E" | "SE" | "S" | "SO" | "O" | "NO";

export type SpeciesId =
  | "brochet"
  | "sandre"
  | "perche"
  | "black-bass"
  | "silure"
  | "anguille";

export type FrenzyLevel =
  | "TRES_MAUVAIS"
  | "FAIBLE"
  | "MOYEN"
  | "BON"
  | "TRES_BON"
  | "EXCEPTIONNEL";

export interface Datum<T> {
  value: T | null;
  unit: string;
  timestamp: string | null;
  source: string;
  kind: DataKind;
  quality: QualityLevel;
  available: boolean;
  note?: string;
}

export interface ModelWeights {
  water: number;
  pressure: number;
  wind: number;
  cloud: number;
  historical: number;
}

export interface LevelThresholds {
  tresMauvais: number;
  faible: number;
  moyen: number;
  bon: number;
  tresBon: number;
  exceptionnel: number;
}

export type SectorId = "sanguinet" | "cazaux" | "biscarrosse" | "parentis";

export interface AppConfig {
  weights: ModelWeights;
  levels: LevelThresholds;
  cacheTtlMinutes: number;
  sectorId: SectorId;
  anglerName: string;
  notifications: boolean;
}

export interface FactorScore {
  id: keyof ModelWeights;
  label: string;
  points: number;
  maxPoints: number;
  rawScore: number;
  available: boolean;
  detail: string;
}

export interface HourlyPoint {
  time: string;
  ifScore: number | null;
  airTempC: number | null;
  waterTempC: number | null;
  pressureHpa: number | null;
  windKmh: number | null;
  windDirDeg: number | null;
  cloudPct: number | null;
  precipMm: number | null;
}

export interface AnalogDay {
  date: string;
  distance: number;
  airTempC: number | null;
  pressureHpa: number | null;
  windKmh: number | null;
  cloudPct: number | null;
  catchesThatDay: number;
}

export interface CatchRecord {
  id: string;
  date: string;
  time: string;
  lat: number | null;
  lon: number | null;
  species: SpeciesId;
  lengthCm: number | null;
  weightKg: number | null;
  lure: string;
  technique: string;
  depthM: number | null;
  comment: string;
  photoPath: string | null;
  weatherSnapshot: {
    airTempC: number | null;
    waterTempC: number | null;
    pressureHpa: number | null;
    windKmh: number | null;
    windCardinal: Cardinal | null;
    cloudPct: number | null;
    ifScore: number | null;
  };
  createdAt: string;
}

export interface FishingAlert {
  id: string;
  kind: "fenetre" | "pression" | "vent" | "temperature" | "exceptionnel";
  title: string;
  body: string;
}

export interface FishingPlanSlot {
  from: string;
  to: string;
  ifScore: number;
  label: string;
  best: boolean;
}

export interface WaterMeasure {
  id: string;
  tempC: number;
  at: string;
  source: "pecheur" | "station";
  note: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  createdAt: string;
}

export interface FishingSession {
  id: string;
  startIso: string;
  durationHours: number;
  species: SpeciesId | "tous";
  createdAt: string;
}

export interface ScoreLog {
  at: string;
  score: number | null;
  confidence: number;
  sectorId: SectorId;
}
