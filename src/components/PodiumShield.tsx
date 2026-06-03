"use client";

import type { PlayerStats } from "@/lib/scoring";

// ── Paleta por posição ──────────────────────────────────────────────────
const TIER = {
  1: {
    c1: "#F0C040", c2: "#C8960C", c3: "#8A6600",
    gem: "#FFF0A0", ring: "#F0C040",
    glow: "drop-shadow(0 0 12px rgba(240,192,48,0.8)) drop-shadow(0 0 30px rgba(240,192,48,0.35))",
    bgFill: "url(#gold-bg)",
    borderStroke: "#F0C040",
    innerStroke: "#C8960C",
    label: "#FFE066",
    anim: "animate-glow-gold animate-float",
    posLabel: "1°",
    crownColor: "#FFD700",
    platformColor: "#1A1400",
    platformBorder: "#F0C040",
  },
  2: {
    c1: "#C8D8E8", c2: "#8FA8C8", c3: "#4A6890",
    gem: "#EAEFFF", ring: "#8FA8C8",
    glow: "drop-shadow(0 0 8px rgba(143,168,200,0.6)) drop-shadow(0 0 22px rgba(143,168,200,0.25))",
    bgFill: "url(#silver-bg)",
    borderStroke: "#8FA8C8",
    innerStroke: "#4A6890",
    label: "#C8D8E8",
    anim: "animate-glow-silver",
    posLabel: "2°",
    crownColor: "#B0C4DE",
    platformColor: "#0C1020",
    platformBorder: "#8FA8C8",
  },
  3: {
    c1: "#E8A060", c2: "#C07030", c3: "#804820",
    gem: "#FFD090", ring: "#C07030",
    glow: "drop-shadow(0 0 8px rgba(192,112,48,0.6)) drop-shadow(0 0 20px rgba(192,112,48,0.22))",
    bgFill: "url(#bronze-bg)",
    borderStroke: "#C07030",
    innerStroke: "#804820",
    label: "#E8A060",
    anim: "animate-glow-bronze",
    posLabel: "3°",
    crownColor: "#CD8C50",
    platformColor: "#0A0700",
    platformBorder: "#C07030",
  },
} as const;

// ── SVG Shield (viewBox 0 0 200 265) ───────────────────────────────────
// Outer shield path
const OUTER = "M100,8 L30,30 L12,56 L12,148 C12,202 52,240 100,260 C148,240 188,202 188,148 L188,56 L170,30 Z";
// Inner border path (inset ~10px)
const INNER = "M100,20 L38,40 L23,64 L23,148 C23,197 58,231 100,249 C142,231 177,197 177,148 L177,64 L162,40 Z";
// Clip path id for content (same as inner)
const CLIP_ID = "shield-content-clip";

// Crown SVG path (small crown at top)
function CrownPath({ color, cx = 100, cy = 8 }: { color: string; cx?: number; cy?: number }) {
  return (
    <g transform={`translate(${cx - 14},${cy - 9})`}>
      <polygon points="0,10 4,2 8,8 14,0 20,8 24,2 28,10" fill={color} opacity="0.9" />
      <rect x="0" y="10" width="28" height="4" rx="1" fill={color} opacity="0.8" />
    </g>
  );
}

// Corner ornament (top-left)
function CornerOrnament({ color, x, y, flip }: { color: string; x: number; y: number; flip?: boolean }) {
  const sx = flip ? -1 : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${sx},1)`} opacity="0.7">
      <path
        d="M0,0 C-6,-4 -10,-10 -6,-14 C-2,-18 6,-14 8,-8 C10,-4 6,2 0,0 Z"
        fill="none" stroke={color} strokeWidth="1.2" />
      <circle cx="-3" cy="-7" r="1.5" fill={color} />
    </g>
  );
}

// ── Component ─────────────────────────────────────────────────────────
export function PodiumShield({
  player,
  position,
  maxPoints,
  bronze = 8,
  silver = 12,
  gold = 16,
}: {
  player: PlayerStats | undefined;
  position: 1 | 2 | 3;
  maxPoints: number;
  bronze?: number;
  silver?: number;
  gold?: number;
}) {
  const t = TIER[position];
  const isFirst = position === 1;

  // Rendered size
  const W = isFirst ? 215 : 178;
  const H = isFirst ? 296 : 246;

  // ID unique por posição para evitar conflito de gradientes no DOM
  const uid = `pos${position}`;

  if (!player) {
    return (
      <div
        className="flex flex-col items-center"
        style={{ width: W, height: H + 40, opacity: 0.3 }}
      >
        <svg viewBox="0 0 200 265" width={W} height={H}>
          <path d={OUTER} fill="rgba(30,46,85,0.4)" stroke="rgba(61,127,255,0.2)" strokeWidth="1" />
        </svg>
        <div className="font-display text-rpg-textDim text-xs mt-2 uppercase">Vaga livre</div>
      </div>
    );
  }

  const pct = Math.min(1, player.rankingPoints / Math.max(1, maxPoints));

  return (
    <div
      className={`flex flex-col items-center ${t.anim}`}
      style={{ width: W }}
    >
      {/* Posição badge + crown no topo do escudo */}
      <div className="relative mb-[-12px] z-10 flex flex-col items-center">
        {isFirst && (
          <div
            className="font-display text-[10px] uppercase tracking-wider2 px-2 py-0.5 mb-1"
            style={{ color: t.crownColor, borderBottom: `1px solid ${t.crownColor}40` }}
          >
            ★ Líder
          </div>
        )}
      </div>

      {/* Shield SVG */}
      <div className="relative" style={{ width: W, height: H }}>
        <svg
          viewBox="0 0 200 265"
          width={W}
          height={H}
          className="absolute inset-0"
          style={{ filter: t.glow }}
        >
          <defs>
            {/* Gradiente de fundo do escudo */}
            <radialGradient id={`${uid}-bg`} cx="50%" cy="30%" r="70%">
              <stop offset="0%"   stopColor={t.c1} stopOpacity="0.10" />
              <stop offset="100%" stopColor="#020510" stopOpacity="0.98" />
            </radialGradient>

            {/* Gradiente da borda */}
            <linearGradient id={`${uid}-border`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={t.c1} />
              <stop offset="50%"  stopColor={t.c2} />
              <stop offset="100%" stopColor={t.c3} />
            </linearGradient>

            {/* Gradiente interno do aro */}
            <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={t.c1} />
              <stop offset="100%" stopColor={t.c3} />
            </linearGradient>

            {/* Clip path para conteúdo */}
            <clipPath id={`${uid}-clip`}>
              <path d={INNER} />
            </clipPath>
          </defs>

          {/* ── Fundo do escudo ── */}
          <path d={OUTER} fill={`url(#${uid}-bg)`} />

          {/* Brilho interior translúcido */}
          <path
            d={OUTER}
            fill="none"
            stroke={`url(#${uid}-border)`}
            strokeWidth="3"
            opacity="0.9"
          />

          {/* Borda interna */}
          <path
            d={INNER}
            fill="none"
            stroke={`url(#${uid}-border)`}
            strokeWidth="1.5"
            opacity="0.65"
          />

          {/* Linha divisória horizontal — movida para baixo da pontuação */}
          <line
            x1="30" y1="210" x2="170" y2="210"
            stroke={t.c2} strokeWidth="0.8" opacity="0.25"
          />

          {/* Ornamentos de canto */}
          <CornerOrnament color={t.c2} x={30}  y={30} />
          <CornerOrnament color={t.c2} x={170} y={30} flip />

          {/* Gema superior (diamante) */}
          <polygon
            points="100,4 109,13 100,22 91,13"
            fill={t.gem}
            opacity="0.95"
            style={{ filter: `drop-shadow(0 0 4px ${t.c1})` }}
          />
          {/* Reflexo na gema */}
          <polygon
            points="100,7 106,13 100,15 94,13"
            fill="white"
            opacity="0.25"
          />

          {/* Ornamentos laterais */}
          <path
            d="M12,90 C6,95 4,105 8,112 C10,116 15,116 17,112"
            fill="none" stroke={t.c3} strokeWidth="1" opacity="0.4"
          />
          <path
            d="M188,90 C194,95 196,105 192,112 C190,116 185,116 183,112"
            fill="none" stroke={t.c3} strokeWidth="1" opacity="0.4"
          />

          {/* Ornamento inferior (ponta) */}
          <polygon
            points="96,256 100,265 104,256 100,252"
            fill={t.c2} opacity="0.6"
          />
          <polygon
            points="98,256 100,262 102,256 100,254"
            fill={t.gem} opacity="0.5"
          />

          {/* ── Avatar ring ── */}
          <circle
            cx="100" cy="105"
            r="40"
            fill="none"
            stroke={`url(#${uid}-ring)`}
            strokeWidth="2.5"
            opacity="0.9"
          />
          <circle
            cx="100" cy="105"
            r="44"
            fill="none"
            stroke={t.c1}
            strokeWidth="0.7"
            opacity="0.35"
          />
          {/* Pequenos ornamentos no anel do avatar (norte, sul, leste, oeste) */}
          <polygon points="100,60  103,65  100,66  97,65"  fill={t.gem} opacity="0.8" />
          <polygon points="100,149 103,144 100,143 97,144" fill={t.gem} opacity="0.8" />
          <polygon points="143,105 138,102 138,108" fill={t.gem} opacity="0.8" />
          <polygon points="57,105  62,102  62,108"  fill={t.gem} opacity="0.8" />

          {/* Barra de progresso na base interna */}
          <rect x="30" y="228" width="140" height="5" rx="2"
            fill="rgba(255,255,255,0.05)" />
          <rect x="30" y="228" width={140 * pct} height="5" rx="2"
            fill={`url(#${uid}-border)`} opacity="0.75" />

          {/* Detalhes filigrana nos cantos inferiores */}
          <path d="M30,195 Q20,205 25,215 Q32,220 38,210" fill="none" stroke={t.c3} strokeWidth="0.8" opacity="0.3" />
          <path d="M170,195 Q180,205 175,215 Q168,220 162,210" fill="none" stroke={t.c3} strokeWidth="0.8" opacity="0.3" />
        </svg>

        {/* ── Avatar (HTML sobre o SVG) ── */}
        <div
          className="absolute z-10"
          style={{
            left: "50%",
            top: `${(H * 105) / 265}px`,
            transform: "translate(-50%, -50%)",
            width: isFirst ? 75 : 63,
            height: isFirst ? 75 : 63,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: `0 0 0 2px ${t.ring}, 0 0 12px ${t.ring}66`,
          }}
        >
          <AvatarImg name={player.name} url={player.avatarUrl} size={isFirst ? 75 : 63} />
        </div>

        {/* ── Nome ── */}
        <div
          className="absolute z-10 w-full text-center px-3"
          style={{ top: isFirst ? 168 : 136 }}
        >
          <div
            className="font-display uppercase tracking-wider2 leading-tight truncate"
            style={{
              fontSize: isFirst ? 13 : 11,
              color: t.c1,
              textShadow: `0 0 8px ${t.c1}80`,
            }}
          >
            {player.name.split(" ")[0]}
          </div>
        </div>

        {/* ── Pontuação ── */}
        <div
          className="absolute z-10 w-full text-center"
          style={{ top: isFirst ? 192 : 156 }}
        >
          <div
            className="font-display leading-none"
            style={{
              fontSize: isFirst ? 30 : 22,
              color: t.label,
              textShadow: `0 0 12px ${t.c1}90, 0 0 24px ${t.c1}40`,
            }}
          >
            {player.rankingPoints}
          </div>
          <div
            className="font-mono uppercase tracking-wider2 opacity-60"
            style={{ fontSize: 9, color: t.label, marginTop: 2 }}
          >
            pts
          </div>
        </div>

        {/* ── Dias ativos ── */}
        <div
          className="absolute z-10 w-full text-center px-2"
          style={{ top: isFirst ? 240 : 200 }}
        >
          <div
            className="font-mono"
            style={{ fontSize: 9, color: t.c2, opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {player.activeDays} dias
            {player.constancyBonus > 0 && (
              <span style={{ color: t.gem }}> +{player.constancyBonus}bônus</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Plataforma do pódio (3D volumétrico) ── */}
      <div className="w-full" style={{ position: "relative" }}>
        {/* Glow de baixo — emana do pedestal */}
        <div
          style={{
            position: "absolute",
            bottom: -8,
            left: "10%",
            right: "10%",
            height: 18,
            background: `radial-gradient(ellipse at 50% 0%, ${t.c1}55, transparent 75%)`,
            filter: "blur(6px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Face superior do pedestal (topo iluminado) */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: 4,
            background: `linear-gradient(90deg, ${t.c3}80, ${t.c1}, ${t.c1}CC, ${t.c1}, ${t.c3}80)`,
            boxShadow: `0 0 8px ${t.c1}80, 0 0 20px ${t.c1}40`,
          }}
        />

        {/* Corpo do pedestal */}
        <div
          className="w-full flex items-center justify-center relative overflow-hidden"
          style={{
            height: isFirst ? 44 : position === 2 ? 30 : 20,
            background: `linear-gradient(180deg, ${t.platformColor === "#1A1400" ? "#2A2000" : t.platformColor === "#0C1020" ? "#141C2E" : "#160C00"} 0%, ${t.platformColor} 60%, rgba(0,0,0,0.95) 100%)`,
            borderLeft:   `1px solid ${t.platformBorder}60`,
            borderRight:  `1px solid ${t.platformBorder}40`,
            borderBottom: `1px solid ${t.platformBorder}30`,
          }}
        >
          {/* Shimmer interno */}
          <div className="absolute inset-0 animate-shimmer" style={{ opacity: 0.25 }} />

          {/* Linhas de detalhe laterais do pedestal */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px"
            style={{ background: `linear-gradient(180deg, ${t.c1}60, transparent)` }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-px"
            style={{ background: `linear-gradient(180deg, ${t.c1}60, transparent)` }}
          />

          <span
            className="relative font-display uppercase tracking-wider2 z-10"
            style={{
              fontSize: isFirst ? 20 : 13,
              color: t.label,
              textShadow: `0 0 10px ${t.c1}90, 0 2px 4px rgba(0,0,0,0.8)`,
              letterSpacing: "0.15em",
            }}
          >
            {t.posLabel}
          </span>
        </div>

        {/* Sombra de profundidade (face frontal escura) */}
        <div
          style={{
            height: isFirst ? 6 : 4,
            background: `linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3))`,
            borderLeft:  `1px solid ${t.platformBorder}20`,
            borderRight: `1px solid ${t.platformBorder}15`,
          }}
        />
      </div>
    </div>
  );
}

// Avatar helper sem dependência do PlayerAvatar (que usa clip-notch)
function AvatarImg({ name, url, size }: { name: string; url: string | null; size: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div
      style={{
        width: size, height: size,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(13,19,48,0.95)",
        overflow: "hidden",
      }}
    >
      {url ? (
        <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }} />
      ) : (
        <span
          style={{
            fontFamily: "var(--font-display), Impact, sans-serif",
            fontSize: size * 0.38,
            color: "#D4DCF0",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {initials || "?"}
        </span>
      )}
    </div>
  );
}
