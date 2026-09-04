"use client";

import { useState } from "react";
import type { SpeciesId } from "@/lib/types";
import { Label } from "./ui";

const SPECIES: SpeciesId[] = ["brochet", "sandre", "perche", "black-bass", "silure", "anguille"];

export function CatchForm({ onSaved }: { onSaved: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/catches", {
      method: "POST",
      body: new FormData(form),
    });
    setBusy(false);
    if (!res.ok) {
      setMsg("Enregistrement impossible");
      return;
    }
    setMsg("Capture enregistrée — météo associée automatiquement.");
    form.reset();
    onSaved();
  }

  const today = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 5);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(e.currentTarget);
      }}
    >
      <Label>Nouvelle capture</Label>
      <div className="grid grid-cols-2 gap-3">
        <input name="date" type="date" defaultValue={today} className="field" required />
        <input name="time" type="time" defaultValue={time} className="field" required />
        <select name="species" className="field col-span-2" defaultValue="brochet">
          {SPECIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input name="lengthCm" type="number" step="0.1" placeholder="Taille cm" className="field" />
        <input name="weightKg" type="number" step="0.01" placeholder="Poids kg" className="field" />
        <input name="lure" placeholder="Leurre" className="field" />
        <input name="technique" placeholder="Technique" className="field" />
        <input name="depthM" type="number" step="0.1" placeholder="Profondeur m" className="field" />
        <input name="lat" type="number" step="0.0001" placeholder="Latitude" className="field" />
        <input name="lon" type="number" step="0.0001" placeholder="Longitude" className="field col-span-2" />
        <input name="photo" type="file" accept="image/*" className="field col-span-2" />
        <textarea name="comment" placeholder="Commentaire" className="field col-span-2 min-h-20" />
      </div>
      <button
        disabled={busy}
        className="w-full rounded-xl bg-teal py-3 font-semibold text-ink-950 disabled:opacity-50"
      >
        {busy ? "Enregistrement…" : "Enregistrer"}
      </button>
      {msg && <p className="text-sm text-mist-300">{msg}</p>}
    </form>
  );
}
