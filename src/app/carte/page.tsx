import { buildSnapshot } from "@/lib/services/snapshot";
import { LakeMap } from "@/components/LakeMap";
import { KindTag, Label, Panel } from "@/components/ui";
import { cardinalLong, fmtNum } from "@/lib/format";
import { listCatches } from "@/lib/store/catches";
import { listLocations } from "@/lib/store/records";
import { LocationForm } from "@/components/LocationForm";

export const dynamic = "force-dynamic";

export default async function CartePage() {
  const snap = await buildSnapshot();
  const windDir = snap.ok ? snap.current.windDirDeg : null;
  const windKmh = snap.ok ? snap.current.windKmh : null;
  const [catches, locations] = await Promise.all([listCatches(), listLocations()]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Carte du lac</h1>
      <p className="text-sm text-mist-500">
        Contour OpenStreetMap du lac (ODbL). Points sur les rives réelles — Sanguinet, Beaurivage,
        Cazaux, Maguide, Ispes, Navarrosse. Pas de bathymétrie inventée.
      </p>
      <LakeMap windDirDeg={windDir} windKmh={windKmh} catches={catches} locations={locations} />
      {snap.ok && (
        <Panel>
          <div className="flex items-center justify-between">
            <Label>Vent — carte</Label>
            <KindTag kind="vecteur" />
          </div>
          <p className="mt-2 text-lg">
            {fmtNum(snap.current.windKmh, 0, "km/h")} {cardinalLong(snap.current.windCardinal)} (
            {snap.current.windDirDeg != null ? `${Math.round(snap.current.windDirDeg)}°` : "—"})
          </p>
          <p className="mt-2 text-sm text-mist-500">
            Trait or : direction du vent. Trait rouge : rive sous le vent (côte battue), calculée sur le
            contour — pas de fonds inventés.
          </p>
        </Panel>
      )}
      <Panel>
        <LocationForm />
      </Panel>
    </div>
  );
}
