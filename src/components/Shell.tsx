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
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink-950/92 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-teal/15 ring-1 ring-teal/30 transition-all group-hover:bg-teal/22 group-hover:ring-teal/50">
              <Fish className="h-5 w-5 text-teal anim-float" />
              {/* online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-950 bg-teal" />
            </span>
            <span>
              <span className="block font-semibold tracking-wide text-mist-100">
                Pêche<span className="text-teal">Sanguinet</span>
              </span>
              <span className="block text-[11px] text-mist-500">
                Lac de Cazaux-Sanguinet
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => {
              const active = path === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm touch-target transition-all ${
                    active
                      ? "text-teal"
                      : "text-mist-400 hover:bg-white/5 hover:text-mist-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {/* Active underline indicator */}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-teal shadow-[0_0_6px_rgba(46,196,182,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 lg:pb-12">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-ink-950/96 backdrop-blur-lg lg:hidden">
        <div className="grid grid-cols-5 px-1 pb-safe py-1">
          {NAV.filter((n) => PRIMARY.includes(n.href)).map((item) => {
            const Icon = item.icon;
            const active = path === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-1 text-[11px]"
              >
                <span
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    active ? "bg-teal/15" : ""
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      active ? "text-teal" : "text-mist-500"
                    }`}
                  />
                  {active && (
                    <span className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal" />
                  )}
                </span>
                <span className={active ? "text-teal" : "text-mist-500"}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setMore((v) => !v)}
            className={`flex flex-col items-center gap-0.5 py-1 text-[11px] ${
              more ? "text-mist-100" : "text-mist-500"
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                more ? "bg-white/10" : ""
              }`}
            >
              <MoreHorizontal className="h-5 w-5" />
            </span>
            Plus
          </button>
        </div>

        {/* Expanded more menu */}
        {more && (
          <div className="grid grid-cols-3 gap-2 border-t border-white/8 px-3 py-3">
            {NAV.filter((n) => !PRIMARY.includes(n.href)).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMore(false)}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-ink-800 px-2 py-3 text-center text-sm text-mist-100 hover:bg-ink-700"
                >
                  <Icon className="h-5 w-5 text-mist-400" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/sources"
              onClick={() => setMore(false)}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-ink-800 px-2 py-3 text-center text-sm text-mist-100 hover:bg-ink-700"
            >
              <span className="text-lg">📡</span>
              Sources
            </Link>
            <Link
              href="/admin"
              onClick={() => setMore(false)}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-ink-800 px-2 py-3 text-center text-sm text-mist-100 hover:bg-ink-700"
            >
              <span className="text-lg">⚙️</span>
              Admin
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}
