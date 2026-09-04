import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/Shell";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "PêcheSanguinet — Fishing Forecast",
  description:
    "Indice de frénésie environnemental pour les carnassiers du lac de Cazaux-Sanguinet. Données, pas de magie.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "PêcheSanguinet",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1117",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
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
