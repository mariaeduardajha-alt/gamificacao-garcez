import type { MedalTier } from "./scoring";

/**
 * Identidade visual dos escudos — fonte única de cores e nomes.
 * `color` é a cor de destaque (textos, barras, bordas);
 * `shade` são os tons usados no desenho SVG do escudo (claro → escuro).
 */
export const TIER_LABEL: Record<MedalTier, string> = {
  GOLD:   "Ouro",
  SILVER: "Prata",
  BRONZE: "Bronze",
  NONE:   "Sem escudo",
};

export const TIER_COLOR: Record<MedalTier, string> = {
  GOLD:   "#F0C040",
  SILVER: "#8FA8C8",
  BRONZE: "#C07030",
  NONE:   "#A78BFA",
};

export const TIER_SHADE: Record<MedalTier, {
  light: string; mid: string; dark: string; gem: string; glow: string; symbol: string;
}> = {
  GOLD: {
    light: "#F0C040", mid: "#C8960C", dark: "#8A6600", gem: "#FFF0A0",
    glow: "drop-shadow(0 0 12px rgba(240,192,48,0.80)) drop-shadow(0 0 30px rgba(240,192,48,0.35))",
    symbol: "III",
  },
  SILVER: {
    light: "#C8D8E8", mid: "#8FA8C8", dark: "#4A6890", gem: "#EAEFFF",
    glow: "drop-shadow(0 0 8px rgba(143,168,200,0.60)) drop-shadow(0 0 22px rgba(143,168,200,0.25))",
    symbol: "II",
  },
  BRONZE: {
    light: "#E8A060", mid: "#C07030", dark: "#804820", gem: "#FFD090",
    glow: "drop-shadow(0 0 8px rgba(192,112,48,0.60)) drop-shadow(0 0 20px rgba(192,112,48,0.22))",
    symbol: "I",
  },
  NONE: {
    light: "#4A5870", mid: "#2E3D55", dark: "#151E2E", gem: "#6A7A90",
    glow: "drop-shadow(0 0 5px rgba(58,77,102,0.35))",
    symbol: "?",
  },
};

/** Classe de animação de brilho por escudo (definidas em globals.css). */
export const TIER_GLOW_ANIMATION: Record<MedalTier, string> = {
  GOLD:   "animate-glow-gold",
  SILVER: "animate-glow-silver",
  BRONZE: "animate-glow-bronze",
  NONE:   "",
};

/** Ordem crescente dos escudos (para saber se houve "subida"). */
export const TIER_RANK: Record<MedalTier, number> = { NONE: 0, BRONZE: 1, SILVER: 2, GOLD: 3 };

/** Posição no pódio → escudo correspondente. */
export const PODIUM_TIER: Record<1 | 2 | 3, MedalTier> = { 1: "GOLD", 2: "SILVER", 3: "BRONZE" };
