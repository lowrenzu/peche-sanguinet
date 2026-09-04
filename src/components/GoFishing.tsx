"use client";

import { useState } from "react";
import { formatTime } from "@/lib/format";
import type { FishingPlanSlot, SpeciesId } from "@/lib/types";
import { Label, Panel, scoreColor } from "./ui";
import { Fish, Zap } from "lucide-react";

const SPECIES: { id: SpeciesId | "tous"; label: string; emoji: string }[] = [
  { id: "tous", label: "Tous carnassiers", emoji: "🎣" },
  { id: "brochet", label: "Brochet", emoji: "🐟" },
  { id: "sandre", label: "Sandre", emoji: "🐠" },
  { id: "perche", label: "Perche", emoji: "🐡" },
  { id: "black-bass", label: "Black-bass", emoji: "🎣" },
  { id: "silure", label: "Silure", emoji: "🦈" },
  { id: "anguille", label: "Anguille", emoji: "🌊" },
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
      body: JSON.stringify({ startIso, durationHours: duration, species }),
    });
    const json = await res.json();
    setSlots(json.slots ?? []);
    setLoading(false);
  }

  return (
    <>
      {/* CTA Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-teal to-teal/80 px-4 py-4 text-base font-semibold text-ink-950 shadow-panel touch-target transition-all hover:shadow-panel-glow hover:brightness-110 active:scale-[0.98]"
      >
        <span className="relative flex items-center justify-center gap-2.5">
          <Fish className="h-5 w-5 anim-wave" />
          Je vais pêcher
          <Zap className="h-4 w-4 opacity-60" />
        </span>
        {/* Shimmer sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/75 p-3 backdrop-blur-sm sm:place-items-center"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <Panel className="anim-fade-in-up w-full max-w-lg bg-ink-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fish className="h-4 w-4 text-teal" />
                <Label>Plan de pêche</Label>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-mist-500 hover:bg-white/5 hover:text-mist-100"
              >
                Fermer ✕
              </button>
            </div>

            <p className="mt-2 text-sm text-mist-300">
              Départ · durée · espèce → plan horaire optimisé. La session est
              enregistrée dans le journal.
            </p>

            {/* Inputs */}
            <label className="mt-4 block text-sm text-mist-300">
              Heure de départ
              <input
                type="datetime-local"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2.5 text-mist-100"
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
                className="mt-1 w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2.5 text-mist-100"
              />
            </label>

            <label className="mt-3 block text-sm text-mist-300">
              Espèce cible
              <select
                value={species}
                onChange={(e) =>
                  setSpecies(e.target.value as SpeciesId | "tous")
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2.5 text-mist-100"
              >
                {SPECIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={run}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-teal py-3 font-semibold text-ink-950 transition-all hover:brightness-110 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-ink-950/30 border-t-ink-950 anim-spin-slow" />
                  Calcul en cours…
                </span>
              ) : (
                "Générer le plan →"
              )}
            </button>

            {/* Slots */}
            {slots && (
              <div className="mt-4 space-y-2">
                {slots.length === 0 && (
                  <p className="text-sm text-signal-mid">
                    Pas de créneau calculable sur cette fenêtre.
                  </p>
                )}
                {slots.map((s) => (
                  <div
                    key={s.from}
                    className={`rounded-xl border px-3 py-3 transition-colors ${
                      s.best
                        ? "border-teal/40 bg-teal/10"
                        : "border-white/8 bg-white/4"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-mist-100">
                        {formatTime(s.from)}–{formatTime(s.to)}
                      </span>
                      <span
                        className={`rounded-lg px-2 py-0.5 font-mono text-sm tabular font-semibold ${
                          s.best
                            ? "bg-teal/20 text-teal"
                            : `${scoreColor(s.ifScore)}`
                        }`}
                      >
                        IF {s.ifScore}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-mist-500">
                      {s.best ? "⭐ MEILLEURE FENÊTRE · " : ""}
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
