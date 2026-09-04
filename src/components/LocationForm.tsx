"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Label } from "./ui";

export function LocationForm() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(form: FormData) {
    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        lat: Number(form.get("lat")),
        lon: Number(form.get("lon")),
      }),
    });
    setMsg(res.ok ? "Spot enregistré" : "Impossible d'enregistrer");
    if (res.ok) router.refresh();
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(new FormData(e.currentTarget));
      }}
    >
      <Label>Spot personnel</Label>
      <p className="text-xs text-mist-500">Vos zones, pas une bathymétrie publique.</p>
      <input name="name" placeholder="Nom du spot" className="field" required />
      <div className="grid grid-cols-2 gap-2">
        <input name="lat" type="number" step="0.0001" placeholder="Lat" className="field" required />
        <input name="lon" type="number" step="0.0001" placeholder="Lon" className="field" required />
      </div>
      <button className="w-full rounded-xl bg-teal py-3 font-semibold text-ink-950">Ajouter</button>
      {msg && <p className="text-sm text-mist-300">{msg}</p>}
    </form>
  );
}
