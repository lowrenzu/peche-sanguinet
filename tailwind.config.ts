import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070b10",
          900: "#0b1117",
          800: "#121a24",
          700: "#182331",
          600: "#223044",
        },
        mist: {
          100: "#e8eef4",
          300: "#b7c4d4",
          400: "#9aafc5",
          500: "#8b9bb0",
        },
        teal: {
          DEFAULT: "#2ec4b6",
          dim: "#1a7a72",
        },
        gold: {
          DEFAULT: "#d4a853",
        },
        signal: {
          good: "#3ddc97",
          mid: "#f5c542",
          bad: "#ff6b4a",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel:
          "0 0 0 1px rgba(46,196,182,0.08), 0 18px 40px rgba(0,0,0,0.35)",
        "panel-glow":
          "0 0 0 1px rgba(46,196,182,0.18), 0 18px 40px rgba(0,0,0,0.35), 0 0 32px rgba(46,196,182,0.08)",
        gold: "0 0 0 1px rgba(212,168,83,0.2), 0 8px 24px rgba(0,0,0,0.25)",
      },
      backgroundImage: {
        "gradient-teal":
          "linear-gradient(135deg, #2ec4b6, #1a7a72)",
        "gradient-gold":
          "linear-gradient(135deg, #d4a853, #a07830)",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(46,196,182,0.65)" },
          "70%": { boxShadow: "0 0 0 9px rgba(46,196,182,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(46,196,182,0)" },
        },
        goldenPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(212,168,83,0.7)" },
          "70%": { boxShadow: "0 0 0 9px rgba(212,168,83,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(212,168,83,0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        waveRock: {
          "0%, 100%": { transform: "rotate(-8deg) translateX(-1px)" },
          "50%": { transform: "rotate(8deg) translateX(1px)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease both",
        "pulse-ring": "pulseRing 2s ease-out infinite",
        "golden-pulse": "goldenPulse 2.2s ease-out infinite",
        float: "float 3s ease-in-out infinite",
        "wave-rock": "waveRock 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
