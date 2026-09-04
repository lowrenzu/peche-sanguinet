"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { LAKE, LAKE_GEOJSON, LAKE_POLYGON, LAKE_ZONES } from "@/lib/lake";
import { downwindBearing, exposedShore } from "@/lib/engines/wind";
import type { CatchRecord, SavedLocation } from "@/lib/types";

function pinEl(name: string, kind: "primary" | "spot" | "catch") {
  const el = document.createElement("div");
  el.className = `lake-pin lake-pin-${kind}`;
  el.innerHTML = `<span class="lake-pin-dot"></span><span class="lake-pin-name">${name}</span>`;
  return el;
}

export function LakeMap({
  windDirDeg,
  windKmh,
  catches = [],
  locations = [],
}: {
  windDirDeg: number | null;
  windKmh: number | null;
  catches?: CatchRecord[];
  locations?: SavedLocation[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: [LAKE.center.lon, LAKE.center.lat],
      zoom: 11,
      attributionControl: true,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.fitBounds(
      [
        [LAKE.bounds.west, LAKE.bounds.south],
        [LAKE.bounds.east, LAKE.bounds.north],
      ],
      { padding: 48, duration: 0 },
    );

    map.on("load", () => {
      map.addSource("lake", {
        type: "geojson",
        data: LAKE_GEOJSON,
      });
      map.addLayer({
        id: "lake-fill",
        type: "fill",
        source: "lake",
        paint: { "fill-color": "#2ec4b6", "fill-opacity": 0.28 },
      });
      map.addLayer({
        id: "lake-line",
        type: "line",
        source: "lake",
        paint: { "line-color": "#7ee8dc", "line-width": 1.6 },
      });

      if (windDirDeg != null && windKmh != null) {
        const to = downwindBearing(windDirDeg);
        const rad = (to * Math.PI) / 180;
        const len = 0.035 + Math.min(windKmh, 40) / 900;
        const from: [number, number] = [LAKE.center.lon, LAKE.center.lat];
        const dest: [number, number] = [
          LAKE.center.lon + Math.sin(rad) * len,
          LAKE.center.lat + Math.cos(rad) * len,
        ];
        map.addSource("wind", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [from, dest] },
          },
        });
        map.addLayer({
          id: "wind-line",
          type: "line",
          source: "wind",
          paint: { "line-color": "#d4a853", "line-width": 3 },
        });
        const ang = Math.atan2(dest[0] - from[0], dest[1] - from[1]);
        const hs = 0.011;
        const head: [number, number][] = [
          [
            dest[0] + Math.sin(ang + Math.PI * 0.82) * hs,
            dest[1] + Math.cos(ang + Math.PI * 0.82) * hs,
          ],
          dest,
          [
            dest[0] + Math.sin(ang - Math.PI * 0.82) * hs,
            dest[1] + Math.cos(ang - Math.PI * 0.82) * hs,
          ],
        ];
        map.addSource("wind-head", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: head },
          },
        });
        map.addLayer({
          id: "wind-head",
          type: "line",
          source: "wind-head",
          paint: { "line-color": "#d4a853", "line-width": 3, "line-cap": "round" },
        });

        const exposed = exposedShore(LAKE_POLYGON, windDirDeg);
        if (exposed.length > 1) {
          map.addSource("exposed", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: exposed },
            },
          });
          map.addLayer({
            id: "exposed-line",
            type: "line",
            source: "exposed",
            paint: { "line-color": "#ff6b4a", "line-width": 4, "line-opacity": 0.9 },
          });
        }
      }

      LAKE_ZONES.forEach((z) => {
        new maplibregl.Marker({
          element: pinEl(z.name, z.id === "sanguinet" ? "primary" : "spot"),
          anchor: "left",
        })
          .setLngLat([z.lon, z.lat])
          .addTo(map);
      });

      catches
        .filter((c) => c.lat != null && c.lon != null)
        .forEach((c) => {
          new maplibregl.Marker({
            element: pinEl(`${c.species}`, "catch"),
            anchor: "left",
          })
            .setLngLat([c.lon as number, c.lat as number])
            .setPopup(new maplibregl.Popup().setText(`${c.species} ${c.date}`))
            .addTo(map);
        });

      locations.forEach((l) => {
        new maplibregl.Marker({
          element: pinEl(l.name, "catch"),
          anchor: "left",
        })
          .setLngLat([l.lon, l.lat])
          .addTo(map);
      });
    });

    return () => map.remove();
  }, [windDirDeg, windKmh, catches, locations]);

  return (
    <div className="relative">
      <div ref={ref} className="h-[560px] w-full overflow-hidden rounded-2xl border border-white/10" />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-white/10 bg-ink-950/80 px-3 py-2 text-[11px] text-mist-300 backdrop-blur-sm">
        <p>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-teal" />
          Contour OSM
        </p>
        <p>
          <span className="mr-1 inline-block h-0.5 w-4 bg-gold align-middle" />
          Vent (vers où il pousse)
        </p>
        <p>
          <span className="mr-1 inline-block h-0.5 w-4 bg-signal-bad align-middle" />
          Rive exposée
        </p>
      </div>
    </div>
  );
}
