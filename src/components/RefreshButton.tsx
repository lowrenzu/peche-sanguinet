"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    await fetch("/api/admin/refresh", { method: "POST" });
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={() => void run()}
      className="rounded-lg border border-white/15 px-3 py-2 text-sm text-mist-300 touch-target"
    >
      {busy ? "Mise à jour…" : "Actualiser"}
    </button>
  );
}
