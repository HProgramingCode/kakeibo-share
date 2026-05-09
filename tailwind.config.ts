import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        ambient: "0 8px 30px rgb(0 0 0 / 0.04)",
        card: "0 4px 20px rgb(79 70 229 / 0.08), 0 1px 3px rgb(0 0 0 / 0.04)",
        "card-hover": "0 8px 30px rgb(79 70 229 / 0.12), 0 2px 4px rgb(0 0 0 / 0.04)",
        dock: "0 -8px 32px rgb(79 70 229 / 0.08), 0 -2px 8px rgb(0 0 0 / 0.04)",
        hero: "0 16px 48px rgb(79 70 229 / 0.20), 0 4px 12px rgb(79 70 229 / 0.08)",
        "hero-btn": "0 12px 36px rgb(79 70 229 / 0.45), 0 4px 12px rgb(79 70 229 / 0.20)",
      },
    },
  },
  plugins: [],
} satisfies Config;
