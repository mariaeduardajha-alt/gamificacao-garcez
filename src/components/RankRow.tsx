import { Avatar } from "@/components/Avatar";
import { MedalBadge } from "@/components/MedalBadge";
import { tierForValue, type PlayerStats } from "@/lib/scoring";
import { TIER_COLOR, PODIUM_TIER } from "@/lib/tiers";
import type { IndividualGoal } from "@/lib/challenge";

const DEFAULT_COLOR = "#3D7FFF";

/** Linha da classificação completa: posição, escudo individual, foto, dias e pontos. */
export function RankRow({
  player,
  position,
  maxPoints,
  goal,
}: { player: PlayerStats; position: number; maxPoints: number; goal: IndividualGoal }) {
  const medal = tierForValue(player.activeDays, goal.bronze, goal.silver, goal.gold);
  const pct = Math.min(100, (player.rankingPoints / maxPoints) * 100);
  const isTop3 = position <= 3;
  const color = isTop3 ? TIER_COLOR[PODIUM_TIER[position as 1 | 2 | 3]] : DEFAULT_COLOR;

  return (
    <div
      className="relative overflow-hidden flex items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 transition-all clip-notch-sm"
      style={{
        background: isTop3 ? `linear-gradient(135deg, ${color}1C, rgba(10,14,32,0.92))` : "rgba(10,14,32,0.85)",
        border: `1px solid ${isTop3 ? `${color}66` : "rgba(61,127,255,0.12)"}`,
        backdropFilter: "blur(10px)",
      }}
    >
      {isTop3 && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      )}

      {/* Posição */}
      <div
        className="font-display text-base sm:text-lg w-7 sm:w-10 text-center shrink-0"
        style={{ color, textShadow: isTop3 ? `0 0 10px ${color}80` : "none" }}
      >
        {position}°
      </div>

      {/* Escudo individual — escondido em telas pequenas para dar espaço ao nome */}
      <div className="shrink-0 hidden sm:block">
        <MedalBadge tier={medal} size={32} />
      </div>

      <Avatar
        name={player.name}
        url={player.avatarUrl}
        size={42}
        shape="notch"
        className={`border-2 ${position === 1 ? "shadow-[0_0_12px_rgba(228,200,110,0.6)]" : ""}`}
        style={{ borderColor: isTop3 ? color : "rgba(30,46,85,0.4)" }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className="font-display uppercase tracking-wider2 leading-tight break-words"
          style={{ fontSize: 13, color: isTop3 ? color : "#D4DCF0" }}
        >
          {player.name}
        </div>
        <div className="font-mono text-[10px] text-rpg-textDim mt-0.5">
          {player.activeDays} dias ativos
          {player.constancyBonus > 0 && (
            <span style={{ color: "#A78BFA" }}> · +{player.constancyBonus} bônus</span>
          )}
        </div>

        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `${color}CC` }} />
        </div>
      </div>

      {/* Pontuação */}
      <div className="text-right shrink-0 pl-1 sm:pl-2">
        <div
          className="font-display text-xl sm:text-2xl leading-none"
          style={{ color, textShadow: isTop3 ? `0 0 12px ${color}60` : "none" }}
        >
          {player.rankingPoints}
        </div>
        <div className="font-mono text-[9px] text-rpg-textDim mt-0.5 uppercase tracking-wider2">pts</div>
      </div>
    </div>
  );
}
