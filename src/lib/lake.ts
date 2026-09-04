import type { SectorId } from "./types";

export const SECTORS: {
  id: SectorId;
  name: string;
  lake: string;
  lat: number;
  lon: number;
  primary: boolean;
}[] = [
  {
    id: "sanguinet",
    name: "Sanguinet",
    lake: "Lac de Cazaux-Sanguinet",
    lat: 44.482,
    lon: -1.086,
    primary: true,
  },
  {
    id: "cazaux",
    name: "Cazaux",
    lake: "Lac de Cazaux-Sanguinet",
    lat: 44.575,
    lon: -1.1,
    primary: false,
  },
  {
    id: "biscarrosse",
    name: "Biscarrosse",
    lake: "Lac de Biscarrosse-Parentis",
    lat: 44.394,
    lon: -1.167,
    primary: false,
  },
  {
    id: "parentis",
    name: "Parentis-en-Born",
    lake: "Lac de Biscarrosse-Parentis",
    lat: 44.35,
    lon: -1.074,
    primary: false,
  },
];

export function sectorById(id: SectorId | string | undefined) {
  return SECTORS.find((s) => s.id === id) ?? SECTORS[0];
}

import lakeGeo from "@/data/lac-cazaux-sanguinet.json";

type Ring = [number, number][];

export const LAKE_GEOJSON = lakeGeo as {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: { name: string };
    geometry: { type: "Polygon"; coordinates: Ring[] };
  }[];
};

const lakePoly = lakeGeo.features[0].geometry as { type: string; coordinates: Ring[] };

/** Contour OSM (way 25050617), simplifié — ODbL. Pas de bathymétrie. */
export const LAKE_POLYGON = lakePoly.coordinates[0] as [number, number][];

export const LAKE = {
  id: "cazaux-sanguinet",
  name: "Lac de Cazaux-Sanguinet",
  sector: "Sanguinet",
  region: "Landes, France",
  timezone: "Europe/Paris",
  center: { lat: 44.4781, lon: -1.1453 },
  sanguinet: { lat: 44.4835, lon: -1.0759 },
  weatherPoint: { lat: 44.482, lon: -1.086, label: "Sanguinet — rive est" },
  bounds: {
    north: 44.5301,
    south: 44.4317,
    west: -1.2013,
    east: -1.0743,
  },
  futureSectors: ["Biscarrosse", "Parentis-en-Born", "Cazaux"] as const,
} as const;

/** Lieux OSM sur les rives, pas au milieu de l'eau. */
export const LAKE_ZONES = [
  { id: "sanguinet", name: "Sanguinet", lat: 44.48348, lon: -1.07594 },
  { id: "beaurivage", name: "Beaurivage", lat: 44.48775, lon: -1.0751 },
  { id: "cazaux", name: "Cazaux", lat: 44.53008, lon: -1.15983 },
  { id: "maguide", name: "Maguide", lat: 44.45757, lon: -1.19966 },
  { id: "ispes", name: "Port d'Ispes", lat: 44.43983, lon: -1.19086 },
  { id: "navarrosse", name: "Navarrosse", lat: 44.43333, lon: -1.16756 },
] as const;

/** Climatologie mensuelle de surface (°C) — moyennes documentées, pas une mesure. */
export const WATER_CLIMATOLOGY_C = [
  9, 9, 11, 14, 18, 20, 23, 23, 20, 15, 12, 9,
] as const;
