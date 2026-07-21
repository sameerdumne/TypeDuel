import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        arena: {
          950: "#080b14",
          900: "#0c0d18",
          800: "#11131d",
          700: "#1a1b26",
          600: "#1e1f2a",
          500: "#282934",
          400: "#333440",
          300: "#383844"
        },
        neon: {
          cyan: "#00daf3",
          "cyan-bright": "#21e6ff",
          "cyan-light": "#c8f6ff",
          pink: "#ffade3",
          "pink-bright": "#ff4fd8",
          "pink-deep": "#c000a2",
          green: "#4edea3",
          "green-bright": "#5ceaae",
          red: "#ef4444"
        },
        surface: {
          DEFAULT: "#11131d",
          fill: "rgba(8, 13, 28, 0.72)",
          border: "rgba(255, 255, 255, 0.1)"
        },
        text: {
          primary: "#f8fbff",
          secondary: "#e2e1f0",
          muted: "#bac9cc",
          dim: "#859396"
        },
        primary: {
          DEFAULT: "#c8f6ff",
          fixed: "#9bf0ff",
          "fixed-dim": "#00daf3",
          container: "#21e6ff"
        },
        "on-primary": {
          DEFAULT: "#00363d",
          fixed: "#001f24",
          container: "#00636f"
        },
        secondary: {
          DEFAULT: "#ffade3",
          fixed: "#ffd8ee",
          "fixed-dim": "#ffade3",
          container: "#c000a2"
        },
        "on-secondary": {
          DEFAULT: "#5f004f",
          fixed: "#3a0030",
          "fixed-variant": "#860070",
          container: "#ffe0f0"
        },
        tertiary: {
          DEFAULT: "#afffd5",
          fixed: "#6ffbbe",
          "fixed-dim": "#4edea3",
          container: "#5ceaae"
        },
        "on-tertiary": {
          DEFAULT: "#003824",
          fixed: "#002113",
          "fixed-variant": "#005236",
          container: "#006746"
        },
        "on-surface": {
          DEFAULT: "#e2e1f0",
          variant: "#bac9cc"
        },
        "on-background": "#e2e1f0",
        outline: {
          DEFAULT: "#859396",
          variant: "#3b494c"
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
          red: "#ef4444"
        },
        "on-error": {
          DEFAULT: "#690005",
          container: "#ffdad6"
        },
        "surface-container": {
          DEFAULT: "#1e1f2a",
          low: "#1a1b26",
          high: "#282934",
          highest: "#333440",
          lowest: "#0c0d18"
        },
        "surface-low": "#10172a",
        "surface-bright": "#383844",
        "surface-dim": "#11131d",
        "surface-variant": "#333440",
        "glass-fill": "rgba(8, 13, 28, 0.72)",
        "glass-border": "rgba(255, 255, 255, 0.1)",
        "selection-blue": "rgba(33, 230, 255, 0.35)",
        "inverse-surface": "#e2e1f0",
        "inverse-on-surface": "#2f303b",
        "inverse-primary": "#006875"
      },
      boxShadow: {
        glow: "0 0 32px rgba(0, 218, 243, 0.25)",
        "glow-strong": "0 0 40px rgba(0, 218, 243, 0.4)",
        "glow-pink": "0 0 32px rgba(255, 73, 227, 0.22)",
        glass: "0 24px 80px rgba(0, 0, 0, 0.5)"
      },
      backgroundImage: {
        "grid-glow":
          "linear-gradient(rgba(0,218,243,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,218,243,0.04) 1px, transparent 1px)",
        "arena-radial":
          "radial-gradient(circle at 10% 20%, rgba(0,218,243,0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255,73,227,0.08) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(78,222,163,0.05) 0%, transparent 50%)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      fontSize: {
        "headline-lg": ["48px", { lineHeight: "1.1", letterSpacing: "0.05em", fontWeight: "800" }],
        "headline-lg-mobile": ["32px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "800" }],
        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "0.025em", fontWeight: "700" }],
        "body-lg": ["20px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "700" }],
        "stats-value": ["32px", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }]
      },
      spacing: {
        gutter: "1.5rem",
        "grid-unit": "44px",
        "stack-sm": "0.5rem",
        "stack-md": "1rem",
        "stack-lg": "2rem",
        "margin-page": "2rem"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", boxShadow: "0 0 10px rgba(0, 218, 243, 0.4)" },
          "50%": { opacity: "1", boxShadow: "0 0 25px rgba(0, 218, 243, 0.8)" }
        },
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        kineticShake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" }
        }
      },
      animation: {
        scan: "scan 2.4s linear infinite",
        pulseGlow: "pulseGlow 1.8s ease-in-out infinite",
        floatIn: "floatIn 0.5s ease-out both",
        kineticShake: "kineticShake 0.2s cubic-bezier(.36,.07,.19,.97) both"
      }
    }
  },
  plugins: []
};

export default config;
