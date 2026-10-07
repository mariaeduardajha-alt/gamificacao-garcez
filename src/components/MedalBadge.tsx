import type { MedalTier } from "@/lib/scoring";
import { TIER_SHADE } from "@/lib/tiers";

// Contorno do escudo (viewBox 0 0 200 265)
export const SHIELD_OUTER = "M100,8 L30,30 L12,56 L12,148 C12,202 52,240 100,260 C148,240 188,202 188,148 L188,56 L170,30 Z";
const SHIELD_INNER = "M100,20 L38,40 L23,64 L23,148 C23,197 58,231 100,249 C142,231 177,197 177,148 L177,64 L162,40 Z";
const SHIELD_RATIO = 265 / 200;

/** Preenchimento decorativo da barra na base, conforme o escudo. */
const TIER_PROGRESS: Record<MedalTier, number> = { GOLD: 1, SILVER: 2 / 3, BRONZE: 1 / 3, NONE: 0 };

/**
 * Desenho do escudo ornamental — único no app. Usado pelo `MedalBadge`
 * (meta coletiva, ranking, metas dos setores) e pelo `PodiumShield`
 * (que sobrepõe foto, nome e pontos).
 */
export function ShieldSvg({
  tier,
  width,
  height = Math.round(width * SHIELD_RATIO),
  progress = TIER_PROGRESS[tier],
  dividerY = 155,
  showSymbol = true,
  idPrefix = "shield",
  className,
}: {
  tier: MedalTier;
  width: number;
  height?: number;
  /** 0..1 — preenchimento da barra na base do escudo */
  progress?: number;
  /** altura (no viewBox) da linha divisória horizontal */
  dividerY?: number;
  showSymbol?: boolean;
  /** prefixo dos ids de gradiente (evita colisão quando há vários escudos na página) */
  idPrefix?: string;
  className?: string;
}) {
  const t = TIER_SHADE[tier];
  const uid = `${idPrefix}-${tier}-${width}`;

  return (
    <svg viewBox="0 0 200 265" width={width} height={height} fill="none" className={className} style={{ filter: t.glow }}>
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor={t.light} stopOpacity={tier === "NONE" ? "0.06" : "0.12"} />
          <stop offset="100%" stopColor="#020510" stopOpacity="0.98" />
        </radialGradient>
        <linearGradient id={`${uid}-bd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={t.light} />
          <stop offset="50%"  stopColor={t.mid} />
          <stop offset="100%" stopColor={t.dark} />
        </linearGradient>
        <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={t.light} />
          <stop offset="100%" stopColor={t.dark} />
        </linearGradient>
      </defs>

      {/* Fundo + bordas externa e interna */}
      <path d={SHIELD_OUTER} fill={`url(#${uid}-bg)`} />
      <path d={SHIELD_OUTER} fill="none" stroke={`url(#${uid}-bd)`} strokeWidth="3" opacity="0.9" />
      <path d={SHIELD_INNER} fill="none" stroke={`url(#${uid}-bd)`} strokeWidth="1.5" opacity="0.6" />

      {/* Linha divisória horizontal */}
      <line x1="30" y1={dividerY} x2="170" y2={dividerY} stroke={t.mid} strokeWidth="0.8" opacity="0.28" />

      {/* Ornamentos de canto */}
      {[{ x: 30, flip: 1 }, { x: 170, flip: -1 }].map(({ x, flip }) => (
        <g key={x} transform={`translate(${x},30) scale(${flip},1)`} opacity="0.68">
          <path d="M0,0 C-6,-4 -10,-10 -6,-14 C-2,-18 6,-14 8,-8 C10,-4 6,2 0,0 Z"
            fill="none" stroke={t.mid} strokeWidth="1.2" />
          <circle cx="-3" cy="-7" r="1.5" fill={t.mid} />
        </g>
      ))}

      {/* Gema superior */}
      <polygon points="100,4 109,13 100,22 91,13" fill={t.gem} opacity="0.95"
        style={{ filter: `drop-shadow(0 0 4px ${t.light})` }} />
      <polygon points="100,7 106,13 100,15 94,13" fill="white" opacity="0.25" />

      {/* Ornamentos laterais e ponta inferior */}
      <path d="M12,90 C6,95 4,105 8,112 C10,116 15,116 17,112" fill="none" stroke={t.dark} strokeWidth="1" opacity="0.4" />
      <path d="M188,90 C194,95 196,105 192,112 C190,116 185,116 183,112" fill="none" stroke={t.dark} strokeWidth="1" opacity="0.4" />
      <polygon points="96,256 100,265 104,256 100,252" fill={t.mid} opacity="0.6" />
      <polygon points="98,256 100,262 102,256 100,254" fill={t.gem} opacity="0.5" />

      {/* Anel central + ornamentos cardinais */}
      <circle cx="100" cy="105" r="40" fill="none" stroke={`url(#${uid}-ring)`} strokeWidth="2.5" opacity="0.88" />
      <circle cx="100" cy="105" r="44" fill="none" stroke={t.light} strokeWidth="0.7" opacity="0.3" />
      <polygon points="100,60  103,65  100,66  97,65"  fill={t.gem} opacity="0.8" />
      <polygon points="100,149 103,144 100,143 97,144" fill={t.gem} opacity="0.8" />
      <polygon points="143,105 138,102 138,108"        fill={t.gem} opacity="0.8" />
      <polygon points="57,105  62,102  62,108"         fill={t.gem} opacity="0.8" />

      {/* Símbolo central (I / II / III / ?) */}
      {showSymbol && (
        <text x="100" y="122" textAnchor="middle" dominantBaseline="middle"
          fontFamily="Tomorrow, Impact, sans-serif" fontSize={tier === "NONE" ? "52" : "38"} fontWeight="900"
          fill={t.light} opacity={tier === "NONE" ? 0.55 : 0.9} letterSpacing="2">
          {t.symbol}
        </text>
      )}

      {/* Barra de progresso na base */}
      <rect x="30" y="228" width="140" height="5" rx="2" fill="rgba(255,255,255,0.05)" />
      {progress > 0 && (
        <rect x="30" y="228" width={140 * Math.min(1, progress)} height="5" rx="2"
          fill={`url(#${uid}-bd)`} opacity="0.72" />
      )}

      {/* Filigrana nos cantos inferiores */}
      <path d="M30,195 Q20,205 25,215 Q32,220 38,210" fill="none" stroke={t.dark} strokeWidth="0.8" opacity="0.28" />
      <path d="M170,195 Q180,205 175,215 Q168,220 162,210" fill="none" stroke={t.dark} strokeWidth="0.8" opacity="0.28" />
    </svg>
  );
}

/** Escudo de medalha (bronze/prata/ouro/sem escudo) num tamanho qualquer. */
export function MedalBadge({ tier, size = 110 }: { tier: MedalTier; size?: number }) {
  return <ShieldSvg tier={tier} width={size} idPrefix="mb" />;
}
