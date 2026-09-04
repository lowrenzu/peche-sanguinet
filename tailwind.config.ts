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
        sans: ["var(--font-dm)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(46,196,182,0.08), 0 18px 40px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
