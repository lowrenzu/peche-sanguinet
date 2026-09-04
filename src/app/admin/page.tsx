"use client";

import { Label, Panel } from "@/components/ui";
import { useEffect, useState } from "react";

interface AdminPayload {
  config: {
    weights: Record<string, number>;
    levels: Record<string, number>;
    cacheTtlMinutes: number;
  };
  sector: { id: string; name: string };
  apis: { name: string; last: string | null; status: string }[];
  errors: { at: string; source: string; message: string }[];
  catchCount: number;
  waterCount: number;
  scores: { at: string; score: number | null; confidence: number }[];
}

export default function AdminPage() {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin");
    setData(await res.json());
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(form: FormData) {
    const weights = {
      water: Number(form.get("water")),
      pressure: Number(form.get("pressure")),
      wind: Number(form.get("wind")),
      cloud: Number(form.get("cloud")),
      historical: Number(form.get("historical")),
    };
    const levels = {
      faible: Number(form.get("faible")),
      moyen: Number(form.get("moyen")),
      bon: Number(form.get("bon")),
      tresBon: Number(form.get("tresBon")),
      exceptionnel: Number(form.get("exceptionnel")),
    };
    const res = await fetch("/api/admin/weights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weights,
        levels: { ...data?.config.levels, ...levels },
        cacheTtlMinutes: Number(form.get("ttl")),
      }),
    });
    setMsg(res.ok ? "Paramètres enregistrés." : "Échec");
    if (res.ok) void load();
  }

  async function refresh() {
    await fetch("/api/admin/refresh", { method: "POST" });
    setMsg("Cache météo vidé.");
    void load();
  }

  if (!data) return <p className="text-mist-500">Chargement admin…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <Panel>
        <Label>État des APIs — {data.sector.name}</Label>
        <ul className="mt-3 space-y-2 text-sm">
          {data.apis.map((a) => (
            <li key={a.name} className="flex justify-between">
              <span>{a.name}</span>
              <span className="text-mist-500">
                {a.status} · {a.last ?? "jamais"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-mist-500">
          Captures {data.catchCount} · mesures d&apos;eau {data.waterCount}
        </p>
        <button type="button" onClick={() => void refresh()} className="mt-3 rounded-lg bg-ink-700 px-3 py-2 text-sm">
          Vider le cache météo
        </button>
      </Panel>
      <Panel>
        <Label>Moteur — pondérations et seuils</Label>
        <form
          className="mt-3 grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void save(new FormData(e.currentTarget));
          }}
        >
          {Object.entries(data.config.weights).map(([k, v]) => (
            <label key={k} className="text-sm text-mist-300">
              {k}
              <input name={k} type="number" step="0.01" min="0" max="1" defaultValue={v} className="field mt-1" />
            </label>
          ))}
          <label className="text-sm text-mist-300">
            Seuil FAIBLE
            <input name="faible" type="number" defaultValue={data.config.levels.faible} className="field mt-1" />
          </label>
          <label className="text-sm text-mist-300">
            Seuil MOYEN
            <input name="moyen" type="number" defaultValue={data.config.levels.moyen} className="field mt-1" />
          </label>
          <label className="text-sm text-mist-300">
            Seuil BON
            <input name="bon" type="number" defaultValue={data.config.levels.bon} className="field mt-1" />
          </label>
          <label className="text-sm text-mist-300">
            Seuil TRÈS BON
            <input name="tresBon" type="number" defaultValue={data.config.levels.tresBon} className="field mt-1" />
          </label>
          <label className="text-sm text-mist-300">
            Seuil EXCEPTIONNEL
            <input
              name="exceptionnel"
              type="number"
              defaultValue={data.config.levels.exceptionnel}
              className="field mt-1"
            />
          </label>
          <label className="text-sm text-mist-300">
            TTL cache (min)
            <input name="ttl" type="number" defaultValue={data.config.cacheTtlMinutes} className="field mt-1" />
          </label>
          <button className="col-span-2 rounded-xl bg-teal py-3 font-semibold text-ink-950">Enregistrer</button>
        </form>
        {msg && <p className="mt-2 text-sm text-mist-300">{msg}</p>}
      </Panel>
      <Panel>
        <Label>Historique des scores</Label>
        <ul className="mt-2 max-h-56 overflow-auto font-mono text-xs tabular text-mist-300">
          {data.scores.length === 0 && <li>Aucun score persisté pour l&apos;instant.</li>}
          {data.scores.map((s) => (
            <li key={s.at} className="flex justify-between border-t border-white/5 py-1">
              <span>{s.at.slice(0, 16).replace("T", " ")}</span>
              <span>
                IF {s.score ?? "—"} · {s.confidence}%
              </span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel>
        <Label>Erreurs récentes</Label>
        {data.errors.length === 0 && <p className="mt-2 text-sm text-mist-500">Aucune</p>}
        <ul className="mt-2 space-y-2 text-xs text-mist-500">
          {data.errors.slice(0, 12).map((e) => (
            <li key={e.at}>
              {e.at} · {e.source} · {e.message}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
