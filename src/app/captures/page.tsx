"use client";

import { CatchForm } from "@/components/CatchForm";
import { KindTag, Label, Panel } from "@/components/ui";
import type { CatchRecord } from "@/lib/types";
import { useEffect, useState } from "react";

export default function CapturesPage() {
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [waterMsg, setWaterMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/catches");
    const json = await res.json();
    setCatches(json.catches ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    await fetch(`/api/catches?id=${id}`, { method: "DELETE" });
    void load();
  }

  async function saveWater(form: FormData) {
    const res = await fetch("/api/water/measure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tempC: Number(form.get("tempC")), note: form.get("note") }),
    });
    setWaterMsg(res.ok ? "Mesure d'eau enregistrée — l'IF l'utilisera si elle a moins de 12 h." : "Échec");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Journal de pêche</h1>
      <p className="text-sm text-mist-500">
        Météo collée à la capture. Photo optionnelle. Mesure d&apos;eau in situ distincte de l&apos;estimation.
      </p>
      <Panel>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            void saveWater(new FormData(e.currentTarget));
          }}
        >
          <Label>Mesure température de l&apos;eau</Label>
          <div className="grid grid-cols-2 gap-2">
            <input name="tempC" type="number" step="0.1" placeholder="°C" className="field" required />
            <input name="note" placeholder="Note (lieu, sonde…)" className="field" />
          </div>
          <button className="rounded-xl bg-gold px-4 py-2 font-semibold text-ink-950">Enregistrer la mesure</button>
          {waterMsg && <p className="text-sm text-mist-300">{waterMsg}</p>}
        </form>
      </Panel>
      <Panel>
        <CatchForm onSaved={load} />
      </Panel>
      {catches.map((c) => (
        <Panel key={c.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold uppercase">{c.species}</p>
              <p className="text-mist-300">
                {c.lengthCm ? `${c.lengthCm} cm` : "taille n/d"} · {c.date} {c.time}
              </p>
            </div>
            <button type="button" onClick={() => remove(c.id)} className="text-sm text-signal-bad">
              Supprimer
            </button>
          </div>
          {c.photoPath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.photoPath} alt="" className="mt-3 max-h-48 rounded-xl object-cover" />
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-mist-300">
            <p>Eau : {c.weatherSnapshot.waterTempC ?? "—"} °C</p>
            <p>Pression : {c.weatherSnapshot.pressureHpa ?? "—"} hPa</p>
            <p>
              Vent : {c.weatherSnapshot.windCardinal ?? "—"} {c.weatherSnapshot.windKmh ?? "—"} km/h
            </p>
            <p>Nuages : {c.weatherSnapshot.cloudPct ?? "—"} %</p>
            <p className="col-span-2">
              IF au moment de la capture : {c.weatherSnapshot.ifScore ?? "—"}/100
            </p>
          </div>
          {c.comment && <p className="mt-2 text-sm text-mist-500">{c.comment}</p>}
          <div className="mt-2">
            <KindTag kind="journal local" />
          </div>
        </Panel>
      ))}
      {catches.length === 0 && (
        <Panel>
          <Label>Aucune capture</Label>
          <p className="mt-2 text-sm text-mist-500">
            Tant que le journal est vide, l&apos;app ne parlera jamais de « probabilité de prendre un brochet ».
          </p>
        </Panel>
      )}
    </div>
  );
}
