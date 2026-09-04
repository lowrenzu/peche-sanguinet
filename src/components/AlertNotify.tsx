"use client";

import { useEffect } from "react";
import type { FishingAlert } from "@/lib/types";

export function AlertNotify({
  alerts,
  enabled,
}: {
  alerts: FishingAlert[];
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled || !alerts.length || typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
      return;
    }
    if (Notification.permission !== "granted") return;
    const top = alerts[0];
    new Notification(top.title, { body: top.body, icon: "/icon.svg" });
  }, [alerts, enabled]);
  return null;
}
