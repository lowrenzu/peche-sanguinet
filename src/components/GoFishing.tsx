"use client";

import { useState } from "react";
import { formatTime } from "@/lib/format";
import type { FishingPlanSlot, SpeciesId } from "@/lib/types";
import { Label, Panel, scoreColor } from "./ui";

const SPECIES: { id: SpeciesId | "tous"; label: string }[] = [
  { id: "tous", label: "Tous carnassiers" },
  { id: "brochet", label: "Brochet" },
  { id: "sandre", label: "Sandre" },
  { id: "perche", label: "Perche" },
  { id: "black-bass", label: "Black-bass" },
  { id: "silure", label: "Silure" },
  { id: "anguille", label: "Anguille" },
];

function localInputValue(d = new Date()) {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 16);
}

export function GoFishing() {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(4);
  const [depart, setDepart] = useState(localInputValue);
  const [species, setSpecies] = useState<SpeciesId | "tous">("brochet");
  const [slots, setSlots] = useState<FishingPlanSlot[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const startIso = new Date(depart).toISOString();
    const res = await fetch("/api/fishing/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startIso,
        durationHours: duration,
        species,
      }),
    });
    const json = await res.json();
    setSlots(json.slots ?? []);
    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-teal px-4 py-4 text-base font-semibold text-ink-950 shadow-panel touch-target"
      >
        Je vais pêcher
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 sm:place-items-center">
          <Panel className="w-full max-w-lg bg-ink-900">
            <div className="flex items-center justify-between">
              <Label>Plan de pêche</Label>
              <button type="button" onClick={() => setOpen(false)} className="text-mist-500">
                Fermer
              </button>
            </div>
            <p className="mt-2 text-sm text-mist-300">
              Départ, durée, espèce → plan horaire. La session est enregistrée dans le journal.
            </p>
            <label className="mt-4 block text-sm text-mist-300">
              Heure de départ
              <input
                type="datetime-local"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2"
              />
            </label>
            <label className="mt-3 block text-sm text-mist-300">
              Durée (heures)
              <input
                type="number"
                min={1}
                max={12}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2"
              />
            </label>
            <label className="mt-3 block text-sm text-mist-300">
              Espèce
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as SpeciesId | "tous")}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2"
              >
                {SPECIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={run}
              className="mt-4 w-full rounded-xl bg-teal py-3 font-semibold text-ink-950"
            >
              {loading ? "Calcul…" : "Générer le plan"}
            </button>
            {slots && (
              <div className="mt-4 space-y-2">
                {slots.length === 0 && (
                  <p className="text-sm text-signal-mid">Pas de créneau calculable sur cette fenêtre.</p>
                )}
                {slots.map((s) => (
                  <div
                    key={s.from}
                    className={`rounded-xl border px-3 py-3 ${
                      s.best ? "border-teal bg-teal/10" : "border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {formatTime(s.from)}–{formatTime(s.to)}
                      </span>
                      <span className={`font-mono tabular ${scoreColor(s.ifScore)}`}>IF {s.ifScore}</span>
                    </div>
                    <p className="text-xs text-mist-500">
                      {s.best ? "MEILLEURE FENÊTRE · " : ""}
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
