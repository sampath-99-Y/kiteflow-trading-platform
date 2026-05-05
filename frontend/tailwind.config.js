/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kite: {
          bg: "#0a0e1a",
          surface: "#0f172a",
          card: "#111827",
          border: "#1e293b",
          accent: "#3b82f6",
          green: "#22c55e",
          red: "#ef4444",
          muted: "#64748b",
          text: "#e2e8f0",
          subtext: "#94a3b8",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-green": "pulseGreen 1s ease-in-out",
        "pulse-red": "pulseRed 1s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-up": "fadeUp 0.4s ease-out",
      },
      keyframes: {
        pulseGreen: {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(34,197,94,0.15)" },
        },
        pulseRed: {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(239,68,68,0.15)" },
        },
        slideIn: {
          from: { transform: "translateX(-100%)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
        fadeUp: {
          from: { transform: "translateY(10px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
