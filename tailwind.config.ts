import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        val: {
          red:     "#FF4655",
          redDark: "#BD3944",
          cream:   "#D4DCF0",          // texto principal (azulado)
          bg:      "#06091A",          // navy profundo
          bgDark:  "#03050F",          // navy mais escuro
          line:    "#1E2E55",          // linhas e bordas
          gold:    "#F0C040",
          cyan:    "#4AB8D4",
        },
        rpg: {
          blue:    "#3D7FFF",
          textDim: "#5A6A8A",          // texto secundário
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"]
      },
      letterSpacing: {
        wider2: "0.15em"
      }
    }
  },
  plugins: []
} satisfies Config;
