import type { MedalTier } from "@/lib/scoring";

interface Tier {
  main: string;
  dark: string;
  light: string;
  glow: string;
  label: string;
  letter: string;
}

const colors: Record<MedalTier, Tier> = {
  GOLD:   { main: "#FFD86B", dark: "#8A5A00", light: "#FFF3C2", glow: "rgba(255,216,107,0.55)", label: "OURO",       letter: "III" },
  SILVER: { main: "#D4DEE8", dark: "#5F6B78", light: "#FFFFFF", glow: "rgba(212,222,232,0.45)", label: "PRATA",      letter: "II" },
  BRONZE: { main: "#D88757", dark: "#6B3817", light: "#FFCE9F", glow: "rgba(216,135,87,0.45)",  label: "BRONZE",     letter: "I" },
  NONE:   { main: "#4A5566", dark: "#1A222D", light: "#6B7A8C", glow: "rgba(74,85,102,0.25)",   label: "SEM ESCUDO", letter: "?" }
};

export function Shield({
  tier,
  size = 96,
  showLabel = true,
  animated = false
}: {
  tier: MedalTier;
  size?: number;
  showLabel?: boolean;
  animated?: boolean;
}) {
  const c = colors[tier];
  const gid = `grad-${tier}-${size}`;
  const sid = `sheen-${tier}-${size}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative ${animated ? "animate-pulse-red" : ""}`}
        style={{
          filter: tier !== "NONE" ? `drop-shadow(0 0 24px ${c.glow})` : "none",
          width: size,
          height: size * 1.2
        }}
      >
        <svg viewBox="0 0 100 120" width={size} height={size * 1.2} fill="none">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.light} />
              <stop offset="45%" stopColor={c.main} />
              <stop offset="100%" stopColor={c.dark} />
            </linearGradient>
            <linearGradient id={sid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* corpo do escudo angular */}
          <path
            d="M50 3 L92 17 L92 58 C92 84 74 104 50 116 C26 104 8 84 8 58 L8 17 Z"
            fill={`url(#${gid})`}
            stroke={c.light}
            strokeWidth="1.5"
          />

          {/* segundo anel interno */}
          <path
            d="M50 12 L84 23 L84 58 C84 78 70 95 50 106 C30 95 16 78 16 58 L16 23 Z"
            fill="none"
            stroke={c.dark}
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* faixa diagonal tipo valorant */}
          <path
            d="M18 50 L82 22 L82 32 L18 60 Z"
            fill={c.dark}
            opacity="0.35"
          />

          {/* sheen */}
          <path
            d="M50 3 L92 17 L92 58 C92 84 74 104 50 116 C26 104 8 84 8 58 L8 17 Z"
            fill={`url(#${sid})`}
          />

          {/* marca central */}
          <text
            x="50"
            y={tier === "NONE" ? 68 : 62}
            textAnchor="middle"
            fontFamily="Tomorrow, Impact, sans-serif"
            fontSize={tier === "NONE" ? "32" : "24"}
            fontWeight="800"
            fill={c.dark}
            letterSpacing="2"
          >
            {c.letter}
          </text>

          {/* detalhes nos cantos */}
          {tier !== "NONE" && (
            <>
              <circle cx="50" cy="80" r="3" fill={c.light} />
              <path d="M35 88 L50 92 L65 88" stroke={c.light} strokeWidth="1" fill="none" opacity="0.7" />
            </>
          )}
        </svg>
      </div>

      {showLabel && (
        <span
          className="font-display uppercase tracking-wider2 text-xs"
          style={{ color: c.main, textShadow: `0 0 10px ${c.glow}` }}
        >
          {c.label}
        </span>
      )}
    </div>
  );
}
