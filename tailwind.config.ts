import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          950: "#070812",
          900: "#0B1020",
          800: "#111827",
          700: "#182137"
        },
        neon: {
          cyan: "#21E6FF",
          green: "#52FF9A",
          pink: "#FF4FD8",
          amber: "#FFD166",
          red: "#FF5C7A"
        }
      },
      boxShadow: {
        glow: "0 0 32px rgba(33, 230, 255, 0.25)",
        "glow-pink": "0 0 32px rgba(255, 79, 216, 0.22)"
      },
      backgroundImage: {
        "grid-glow":
          "linear-gradient(rgba(33,230,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,79,216,0.06) 1px, transparent 1px)",
        "arena-radial":
          "linear-gradient(135deg, rgba(33,230,255,0.16), transparent 34%), linear-gradient(225deg, rgba(255,79,216,0.12), transparent 30%), linear-gradient(0deg, rgba(82,255,154,0.08), transparent 42%)"
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" }
        },
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        scan: "scan 2.4s linear infinite",
        pulseGlow: "pulseGlow 1.8s ease-in-out infinite",
        floatIn: "floatIn 0.5s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
