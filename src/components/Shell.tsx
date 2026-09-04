"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Fish,
  Home,
  Map,
  MoreHorizontal,
  Settings,
  Waves,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/prevision", label: "Prévision", icon: Activity },
  { href: "/carte", label: "Carte", icon: Map },
  { href: "/historique", label: "Historique", icon: BarChart3 },
  { href: "/captures", label: "Captures", icon: Fish },
  { href: "/analyse", label: "Analyse", icon: Waves },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

const PRIMARY = ["/", "/prevision", "/carte", "/captures"];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [more, setMore] = useState(false);

  return (
    <div className="min-h-screen grid-paper">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal/15 text-teal ring-1 ring-teal/40">
              <Fish className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold tracking-wide text-mist-100">PêcheSanguinet</span>
              <span className="block text-xs text-mist-500">Lac de Cazaux-Sanguinet</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = path === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm touch-target ${
                    active
                      ? "bg-white/10 text-teal"
                      : "text-mist-300 hover:bg-white/5 hover:text-mist-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 lg:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-5 px-1 py-1">
          {NAV.filter((n) => PRIMARY.includes(n.href)).map((item) => {
            const Icon = item.icon;
            const active = path === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                  active ? "text-teal" : "text-mist-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMore((v) => !v)}
            className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-mist-500"
          >
            <MoreHorizontal className="h-5 w-5" />
            Plus
          </button>
        </div>
        {more && (
          <div className="grid grid-cols-3 gap-2 border-t border-white/10 px-3 py-3">
            {NAV.filter((n) => !PRIMARY.includes(n.href)).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMore(false)}
                className="rounded-lg bg-ink-800 px-3 py-3 text-center text-sm text-mist-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/sources"
              onClick={() => setMore(false)}
              className="rounded-lg bg-ink-800 px-3 py-3 text-center text-sm text-mist-100"
            >
              Sources
            </Link>
            <Link
              href="/admin"
              onClick={() => setMore(false)}
              className="rounded-lg bg-ink-800 px-3 py-3 text-center text-sm text-mist-100"
            >
              Admin
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}
