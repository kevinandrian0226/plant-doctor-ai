import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep green (primary)
        leaf: {
          50: "#f0f7f1",
          100: "#dbecdd",
          200: "#b8debf",
          300: "#8ec795",
          400: "#5da968",
          500: "#3c8c48",
          600: "#2c7038",
          700: "#22562d",
          800: "#1d4526",
          900: "#193a21",
          950: "#0b2011",
        },
        // Sage (secondary / muted accents & borders)
        sage: {
          50: "#f5f7f3",
          100: "#e7ece2",
          200: "#d0d9c8",
          300: "#aebfa3",
          400: "#889c7c",
          500: "#6b8060",
          600: "#54664b",
          700: "#44523e",
          800: "#394434",
          900: "#31392d",
        },
        // Charcoal (text)
        charcoal: {
          DEFAULT: "#262b27",
          light: "#4a514b",
          muted: "#6e756f",
        },
        // Off-white surfaces
        cream: {
          50: "#fbfcf9",
          100: "#f6f8f2",
          200: "#eef1e8",
        },
        sand: {
          50: "#faf8f3",
          100: "#f3eee1",
          200: "#e6dac2",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 6px 28px -12px rgba(28, 71, 39, 0.18)",
        card: "0 1px 2px rgba(20, 30, 22, 0.04), 0 10px 30px -18px rgba(20, 30, 22, 0.16)",
        lift: "0 12px 40px -16px rgba(20, 30, 22, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
