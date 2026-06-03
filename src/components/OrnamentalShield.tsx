import type { MedalTier } from "@/lib/scoring";

// Mesmos paths do PodiumShield — uniformidade total
const OUTER = "M100,8 L30,30 L12,56 L12,148 C12,202 52,240 100,260 C148,240 188,202 188,148 L188,56 L170,30 Z";
const INNER = "M100,20 L38,40 L23,64 L23,148 C23,197 58,231 100,249 C142,231 177,197 177,148 L177,64 L162,40 Z";

// Mesmas cores do PodiumShield para Bronze/Silver/Gold
// NONE usa tons neutros escuros para simbolizar ausência de título
const TIER: Record<MedalTier, {
  c1: string; c2: string; c3: string; gem: string; ring: string;
  glow: string; symbol: string;
}> = {
  GOLD: {
    c1: "#F0C040", c2: "#C8960C", c3: "#8A6600", gem: "#FFF0A0", ring: "#F0C040",
    glow: "drop-shadow(0 0 12px rgba(240,192,48,0.80)) drop-shadow(0 0 30px rgba(240,192,48,0.35))",
    symbol: "III",
  },
  SILVER: {
    c1: "#C8D8E8", c2: "#8FA8C8", c3: "#4A6890", gem: "#EAEFFF", ring: "#8FA8C8",
    glow: "drop-shadow(0 0 8px rgba(143,168,200,0.60)) drop-shadow(0 0 22px rgba(143,168,200,0.25))",
    symbol: "II",
  },
  BRONZE: {
    c1: "#E8A060", c2: "#C07030", c3: "#804820", gem: "#FFD090", ring: "#C07030",
    glow: "drop-shadow(0 0 8px rgba(192,112,48,0.60)) drop-shadow(0 0 20px rgba(192,112,48,0.22))",
    symbol: "I",
  },
  NONE: {
    c1: "#4A5870", c2: "#2E3D55", c3: "#151E2E", gem: "#6A7A90", ring: "#3A4D66",
    glow: "drop-shadow(0 0 5px rgba(58,77,102,0.35))",
    symbol: "?",
  },
};

export function OrnamentalShield({ tier, size = 110 }: { tier: MedalTier; size?: number }) {
  const t = TIER[tier];
  const uid = `cs-${tier}`;
  const H  = Math.round(size * (265 / 200));   // mesma proporção do PodiumShield

  return (
    <div style={{ width: size, height: H, position: "relative" }}>
      <svg viewBox="0 0 200 265" width={size} height={H} fill="none" style={{ filter: t.glow }}>
        <defs>
          {/* Fundo radial */}
          <radialGradient id={`${uid}-bg`} cx="50%" cy="30%" r="70%">
            <stop offset="0%"   stopColor={t.c1} stopOpacity={tier === "NONE" ? "0.06" : "0.12"} />
            <stop offset="100%" stopColor="#020510" stopOpacity="0.98" />
          </radialGradient>

          {/* Borda */}
          <linearGradient id={`${uid}-bd`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={t.c1} />
            <stop offset="50%"  stopColor={t.c2} />
            <stop offset="100%" stopColor={t.c3} />
          </linearGradient>

          {/* Anel do avatar */}
          <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={t.c1} />
            <stop offset="100%" stopColor={t.c3} />
          </linearGradient>
        </defs>

        {/* ── Fundo ── */}
        <path d={OUTER} fill={`url(#${uid}-bg)`} />

        {/* ── Borda externa ── */}
        <path d={OUTER} fill="none" stroke={`url(#${uid}-bd)`} strokeWidth="3" opacity="0.9" />

        {/* ── Borda interna ── */}
        <path d={INNER} fill="none" stroke={`url(#${uid}-bd)`} strokeWidth="1.5" opacity="0.55" />

        {/* ── Linha divisória horizontal ── */}
        <line x1="30" y1="155" x2="170" y2="155" stroke={t.c2} strokeWidth="0.8" opacity="0.30" />

        {/* ── Ornamentos de canto ── */}
        <g transform="translate(30,30)" opacity="0.65">
          <path d="M0,0 C-6,-4 -10,-10 -6,-14 C-2,-18 6,-14 8,-8 C10,-4 6,2 0,0 Z"
            fill="none" stroke={t.c2} strokeWidth="1.2" />
          <circle cx="-3" cy="-7" r="1.5" fill={t.c2} />
        </g>
        <g transform="translate(170,30) scale(-1,1)" opacity="0.65">
          <path d="M0,0 C-6,-4 -10,-10 -6,-14 C-2,-18 6,-14 8,-8 C10,-4 6,2 0,0 Z"
            fill="none" stroke={t.c2} strokeWidth="1.2" />
          <circle cx="-3" cy="-7" r="1.5" fill={t.c2} />
        </g>

        {/* ── Gema superior (diamante) ── */}
        <polygon points="100,4 109,13 100,22 91,13"
          fill={t.gem} opacity="0.95"
          style={{ filter: `drop-shadow(0 0 4px ${t.c1})` }} />
        <polygon points="100,7 106,13 100,15 94,13" fill="white" opacity="0.25" />

        {/* ── Ornamentos laterais ── */}
        <path d="M12,90 C6,95 4,105 8,112 C10,116 15,116 17,112"
          fill="none" stroke={t.c3} strokeWidth="1" opacity="0.4" />
        <path d="M188,90 C194,95 196,105 192,112 C190,116 185,116 183,112"
          fill="none" stroke={t.c3} strokeWidth="1" opacity="0.4" />

        {/* ── Ornamento inferior (ponta) ── */}
        <polygon points="96,256 100,265 104,256 100,252" fill={t.c2} opacity="0.6" />
        <polygon points="98,256 100,262 102,256 100,254" fill={t.gem} opacity="0.5" />

        {/* ── Anel do avatar (mesmo do PodiumShield) ── */}
        <circle cx="100" cy="105" r="40" fill="none"
          stroke={`url(#${uid}-ring)`} strokeWidth="2.5" opacity="0.85" />
        <circle cx="100" cy="105" r="44" fill="none"
          stroke={t.c1} strokeWidth="0.7" opacity="0.28" />

        {/* Ornamentos cardinais no anel */}
        <polygon points="100,60  103,65  100,66  97,65"  fill={t.gem} opacity="0.80" />
        <polygon points="100,149 103,144 100,143 97,144" fill={t.gem} opacity="0.80" />
        <polygon points="143,105 138,102 138,108"        fill={t.gem} opacity="0.80" />
        <polygon points="57,105  62,102  62,108"         fill={t.gem} opacity="0.80" />

        {/* ── Símbolo central ── */}
        <text
          x="100" y="122"
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="Tomorrow, Impact, sans-serif"
          fontSize={tier === "NONE" ? "52" : "38"}
          fontWeight="900"
          fill={t.c1}
          opacity={tier === "NONE" ? 0.55 : 0.90}
          letterSpacing="2"
        >
          {t.symbol}
        </text>

        {/* ── Barra de progresso (visual decorativo — preenchida conforme tier) ── */}
        <rect x="30" y="228" width="140" height="5" rx="2"
          fill="rgba(255,255,255,0.05)" />
        {tier !== "NONE" && (
          <rect x="30" y="228"
            width={tier === "GOLD" ? 140 : tier === "SILVER" ? 93 : 47}
            height="5" rx="2"
            fill={`url(#${uid}-bd)`} opacity="0.7" />
        )}

        {/* ── Filigrana nos cantos inferiores ── */}
        <path d="M30,195 Q20,205 25,215 Q32,220 38,210"
          fill="none" stroke={t.c3} strokeWidth="0.8" opacity="0.28" />
        <path d="M170,195 Q180,205 175,215 Q168,220 162,210"
          fill="none" stroke={t.c3} strokeWidth="0.8" opacity="0.28" />
      </svg>
    </div>
  );
}
