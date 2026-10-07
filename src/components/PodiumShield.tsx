import type { PlayerStats } from "@/lib/scoring";
import { TIER_COLOR, TIER_SHADE, TIER_GLOW_ANIMATION, PODIUM_TIER } from "@/lib/tiers";
import { firstName } from "@/lib/format";
import { ShieldSvg, SHIELD_OUTER } from "./MedalBadge";
import { Avatar } from "./Avatar";

/** Escudo de uma posição do pódio (1°, 2° ou 3°) com foto, nome, pontos e pedestal. */
export function PodiumShield({
  player,
  position,
  maxPoints,
}: {
  player: PlayerStats | undefined;
  position: 1 | 2 | 3;
  maxPoints: number;
}) {
  const tier = PODIUM_TIER[position];
  const t = TIER_SHADE[tier];
  const color = TIER_COLOR[tier];
  const isFirst = position === 1;

  // Tamanho renderizado
  const W = isFirst ? 215 : 178;
  const H = isFirst ? 296 : 246;

  if (!player) {
    return (
      <div className="flex flex-col items-center" style={{ width: W, height: H + 40, opacity: 0.3 }}>
        <svg viewBox="0 0 200 265" width={W} height={H}>
          <path d={SHIELD_OUTER} fill="rgba(30,46,85,0.4)" stroke="rgba(61,127,255,0.2)" strokeWidth="1" />
        </svg>
        <div className="font-display text-rpg-textDim text-xs mt-2 uppercase">Vaga livre</div>
      </div>
    );
  }

  const pct = Math.min(1, player.rankingPoints / Math.max(1, maxPoints));
  const avatarSize = isFirst ? 75 : 63;

  return (
    <div
      className={`flex flex-col items-center ${TIER_GLOW_ANIMATION[tier]} ${isFirst ? "animate-float" : ""}`}
      style={{ width: W }}
    >
      {isFirst && (
        <div className="relative mb-[-12px] z-10">
          <div
            className="font-display text-[10px] uppercase tracking-wider2 px-2 py-0.5 mb-1"
            style={{ color: t.light, borderBottom: `1px solid ${t.light}40` }}
          >
            ★ Líder
          </div>
        </div>
      )}

      {/* Escudo + conteúdo sobreposto */}
      <div className="relative" style={{ width: W, height: H }}>
        <ShieldSvg
          tier={tier}
          width={W}
          height={H}
          progress={pct}
          dividerY={210}
          showSymbol={false}
          idPrefix={`pos${position}`}
          className="absolute inset-0"
        />

        <div
          className="absolute z-10"
          style={{ left: "50%", top: `${(H * 105) / 265}px`, transform: "translate(-50%, -50%)" }}
        >
          <Avatar
            name={player.name}
            url={player.avatarUrl}
            size={avatarSize}
            style={{ boxShadow: `0 0 0 2px ${t.mid}, 0 0 12px ${t.mid}66` }}
          />
        </div>

        {/* Nome */}
        <div className="absolute z-10 w-full text-center px-3" style={{ top: isFirst ? 168 : 136 }}>
          <div
            className="font-display uppercase tracking-wider2 leading-tight truncate"
            style={{ fontSize: isFirst ? 13 : 11, color: t.light, textShadow: `0 0 8px ${t.light}80` }}
          >
            {firstName(player.name)}
          </div>
        </div>

        {/* Pontuação */}
        <div className="absolute z-10 w-full text-center" style={{ top: isFirst ? 192 : 156 }}>
          <div
            className="font-display leading-none"
            style={{ fontSize: isFirst ? 30 : 22, color: t.light, textShadow: `0 0 12px ${t.light}90, 0 0 24px ${t.light}40` }}
          >
            {player.rankingPoints}
          </div>
          <div className="font-mono uppercase tracking-wider2 opacity-60" style={{ fontSize: 9, color: t.light, marginTop: 2 }}>
            pts
          </div>
        </div>

        {/* Dias ativos */}
        <div className="absolute z-10 w-full text-center px-2" style={{ top: isFirst ? 240 : 200 }}>
          <div
            className="font-mono"
            style={{ fontSize: 9, color: t.mid, opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {player.activeDays} dias
            {player.constancyBonus > 0 && <span style={{ color: t.gem }}> +{player.constancyBonus}bônus</span>}
          </div>
        </div>
      </div>

      {/* Pedestal do pódio */}
      <div className="w-full relative">
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -8, left: "10%", right: "10%", height: 18,
            background: `radial-gradient(ellipse at 50% 0%, ${t.light}55, transparent 75%)`,
            filter: "blur(6px)",
          }}
        />
        <div
          className="relative z-[1]"
          style={{
            height: 4,
            background: `linear-gradient(90deg, ${t.dark}80, ${t.light}, ${t.light}CC, ${t.light}, ${t.dark}80)`,
            boxShadow: `0 0 8px ${t.light}80, 0 0 20px ${t.light}40`,
          }}
        />
        <div
          className="w-full flex items-center justify-center relative overflow-hidden"
          style={{
            height: isFirst ? 44 : position === 2 ? 30 : 20,
            background: `linear-gradient(180deg, ${t.dark}55 0%, #06091A 60%, rgba(0,0,0,0.95) 100%)`,
            borderLeft:   `1px solid ${color}60`,
            borderRight:  `1px solid ${color}40`,
            borderBottom: `1px solid ${color}30`,
          }}
        >
          <div className="absolute inset-0 animate-shimmer" style={{ opacity: 0.25 }} />
          <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, ${t.light}60, transparent)` }} />
          <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, ${t.light}60, transparent)` }} />
          <span
            className="relative font-display uppercase z-10"
            style={{
              fontSize: isFirst ? 20 : 13,
              color: t.light,
              textShadow: `0 0 10px ${t.light}90, 0 2px 4px rgba(0,0,0,0.8)`,
              letterSpacing: "0.15em",
            }}
          >
            {position}°
          </span>
        </div>
        <div
          style={{
            height: isFirst ? 6 : 4,
            background: "linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
            borderLeft:  `1px solid ${color}20`,
            borderRight: `1px solid ${color}15`,
          }}
        />
      </div>
    </div>
  );
}
