import type { Metadata, Viewport } from "next";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { Shell } from "@/components/Shell";
import "./globals.css";

const dm = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "PêcheSanguinet — Fishing Forecast",
  description:
    "Indice de frénésie environnemental pour les carnassiers du lac de Cazaux-Sanguinet. Données, pas de magie.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "PêcheSanguinet", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b1117",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${dm.variable} ${plex.variable} font-sans antialiased`}>
        <Shell>{children}</Shell>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </body>
    </html>
  );
}
