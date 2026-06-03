import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        val: {
          red:     "#FF4655",
          redDark: "#BD3944",
          cream:   "#D4DCF0",          // azulado agora
          bg:      "#06091A",          // navy profundo
          bgDark:  "#03050F",          // navy mais escuro
          panel:   "#0D1330",          // painel azul escuro
          line:    "#1E2E55",          // linha azul
          gold:    "#F0C040",
          cyan:    "#4AB8D4",
        },
        rpg: {
          purple:    "#7C4DFF",
          purpleGlow:"rgba(124,77,255,0.35)",
          blue:      "#3D7FFF",
          blueGlow:  "rgba(61,127,255,0.35)",
          violet:    "#A78BFA",
          teal:      "#2DD4BF",
          gold:      "#F0C040",
          goldGlow:  "rgba(240,192,48,0.5)",
          silver:    "#8FA8C8",
          bronze:    "#C07030",
          dark:      "#06091A",
          panel:     "#0D1330",
          card:      "#101A38",
          border:    "#1E2E55",
          text:      "#D4DCF0",
          textDim:   "#5A6A8A",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"]
      },
      letterSpacing: {
        wider2: "0.15em"
      },
      clipPath: {
        notch:     "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
        notchLeft: "polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)"
      }
    }
  },
  plugins: []
} satisfies Config;
