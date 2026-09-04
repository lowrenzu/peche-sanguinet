"use client";

import Link from "next/link";
import { Label, Panel } from "@/components/ui";
import { useEffect, useState } from "react";

const SECTORS = [
  { id: "sanguinet", name: "Sanguinet (principal)" },
  { id: "cazaux", name: "Cazaux" },
  { id: "biscarrosse", name: "Biscarrosse" },
  { id: "parentis", name: "Parentis-en-Born" },
];

export default function ParametresPage() {
  const [name, setName] = useState("");
  const [sectorId, setSectorId] = useState("sanguinet");
  const [notifications, setNotifications] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin")
      .then((r) => r.json())
      .then((d) => {
        setName(d.config?.anglerName ?? "");
        setSectorId(d.config?.sectorId ?? "sanguinet");
        setNotifications(Boolean(d.config?.notifications));
      });
  }, []);

  async function save() {
    if (notifications && typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    const res = await fetch("/api/admin/weights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anglerName: name, sectorId, notifications }),
    });
    setMsg(res.ok ? "Enregistré. Rechargez l'accueil pour le nouveau secteur." : "Échec");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      <Panel>
        <Label>Profil local</Label>
        <p className="mt-1 text-xs text-mist-500">Pas de compte cloud en V1 — stockage serveur local.</p>
        <input
          className="field mt-3"
          placeholder="Votre nom / pseudo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Panel>
      <Panel>
        <Label>Secteur</Label>
        <p className="mt-1 text-xs text-mist-500">
          Sanguinet reste le territoire principal. Les autres points changent la météo, pas un modèle calibré.
        </p>
        <select className="field mt-3" value={sectorId} onChange={(e) => setSectorId(e.target.value)}>
          {SECTORS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Panel>
      <Panel>
        <Label>Alertes navigateur</Label>
        <label className="mt-3 flex items-center gap-2 text-sm text-mist-300">
          <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
          Notifier une fenêtre favorable (si le navigateur le permet)
        </label>
      </Panel>
      <button onClick={() => void save()} className="w-full rounded-xl bg-teal py-3 font-semibold text-ink-950">
        Enregistrer
      </button>
      {msg && <p className="text-sm text-mist-300">{msg}</p>}
      <Panel>
        <Label>Liens</Label>
        <div className="mt-3 flex flex-col gap-2 text-sm">
          <Link className="text-teal" href="/sources">
            Sources & méthodologie
          </Link>
          <Link className="text-teal" href="/admin">
            Administration du moteur
          </Link>
        </div>
      </Panel>
    </div>
  );
}
