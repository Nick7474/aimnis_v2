import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* shadcn/ui 색상 — CSS var 직접 참조 (oklch 호환) */
        background: "oklch(8% 0.025 275)",
        foreground: "oklch(96% 0.008 275)",
        card: {
          DEFAULT: "oklch(11% 0.022 275)",
          foreground: "oklch(96% 0.008 275)",
        },
        popover: {
          DEFAULT: "oklch(11% 0.022 275)",
          foreground: "oklch(96% 0.008 275)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "white",
        },
        secondary: {
          DEFAULT: "oklch(18% 0.018 275)",
          foreground: "oklch(96% 0.008 275)",
        },
        muted: {
          DEFAULT: "oklch(14% 0.020 275)",
          foreground: "oklch(45% 0.010 275)",
        },
        accent: {
          DEFAULT: "var(--primary)",
          foreground: "white",
        },
        destructive: {
          DEFAULT: "oklch(58% 0.22 25)",
          foreground: "white",
        },
        border: "var(--border)",
        input: "oklch(22% 0.016 275)",
        ring: "var(--primary)",
        chart: {
          "1": "oklch(60% 0.20 285)",
          "2": "oklch(60% 0.20 245)",
          "3": "oklch(70% 0.14 210)",
          "4": "oklch(65% 0.16 145)",
          "5": "oklch(68% 0.18 55)",
        },
        brand: {
          50: "#f1effd",
          100: "#e5e1fc",
          200: "#cec6f8",
          300: "#ada0f3",
          400: "#8b77eb",
          500: "#735fe9",
          600: "#5a3ee1",
          700: "#4a2fc5",
          800: "#3e27a4",
          900: "#342384",
          950: "#21155a",
        },
        ds: {
          bg: "var(--ds-bg)",
          s1: "var(--ds-s1)",
          s2: "var(--ds-s2)",
          s3: "var(--ds-s3)",
          s4: "var(--ds-s4)",
          border: "var(--ds-border)",
          border2: "var(--ds-border2)",
          border3: "var(--ds-border3)",
          primary: "var(--ds-primary)",
          t1: "var(--ds-t1)",
          t2: "var(--ds-t2)",
          t3: "var(--ds-t3)",
          t4: "var(--ds-t4)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        aurora: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        aurora: "aurora 8s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
