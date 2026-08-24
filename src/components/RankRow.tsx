import { PlayerAvatar } from "@/components/PlayerAvatar";
import { MedalBadge } from "@/components/MedalBadge";
import { medalForTotal, type PlayerStats, type MedalTier } from "@/lib/scoring";

const POSITION_COLORS: Record<number, { bar: string; badge: string; badgeBg: string; badgeBorder: string }> = {
  1: { bar: "rgba(240,192,48,0.8)",   badge: "#F0C040", badgeBg: "rgba(240,192,48,0.12)",  badgeBorder: "rgba(240,192,48,0.4)"  },
  2: { bar: "rgba(143,168,200,0.8)",  badge: "#8FA8C8", badgeBg: "rgba(143,168,200,0.10)", badgeBorder: "rgba(143,168,200,0.35)" },
  3: { bar: "rgba(192,112,48,0.8)",   badge: "#C07030", badgeBg: "rgba(192,112,48,0.10)",  badgeBorder: "rgba(192,112,48,0.35)" },
};

export function RankRow({
  player,
  position,
  maxPoints,
  bronze,
  silver,
  gold,
}: { player: PlayerStats; position: number; maxPoints: number; bronze: number; silver: number; gold: number }) {
  const medal: MedalTier = medalForTotal(player.activeDays, bronze, silver, gold);
  const pct = Math.min(100, (player.rankingPoints / maxPoints) * 100);
  const colors = POSITION_COLORS[position] ?? {
    bar: "rgba(61,127,255,0.6)",
    badge: "#3D7FFF",
    badgeBg: "rgba(61,127,255,0.08)",
    badgeBorder: "rgba(61,127,255,0.25)",
  };
  const isTop3 = position <= 3;

  return (
    <div
      className="relative overflow-hidden flex items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 transition-all"
      style={{
        background: isTop3
          ? `linear-gradient(135deg, ${colors.badgeBg}, rgba(10,14,32,0.92))`
          : "rgba(10,14,32,0.85)",
        border: `1px solid ${isTop3 ? colors.badgeBorder : "rgba(61,127,255,0.12)"}`,
        backdropFilter: "blur(10px)",
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
      }}
    >
      {/* Top accent line for top 3 */}
      {isTop3 && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${colors.badge}, transparent)` }}
        />
      )}

      {/* Posição badge */}
      <div
        className="font-display text-base sm:text-lg w-7 sm:w-10 text-center shrink-0"
        style={{
          color: colors.badge,
          textShadow: isTop3 ? `0 0 10px ${colors.badge}80` : "none",
        }}
      >
        {position}°
      </div>

      {/* Escudo (Medal tier) — escondido em telas pequenas para dar espaço ao nome */}
      <div className="shrink-0 hidden sm:block">
        <MedalBadge tier={medal} size={32} />
      </div>

      {/* Avatar */}
      <div className="shrink-0">
        <PlayerAvatar name={player.name} url={player.avatarUrl} size={42} rank={position} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className="font-display uppercase tracking-wider2 leading-tight break-words"
          style={{ fontSize: 13, color: isTop3 ? colors.badge : "#D4DCF0" }}
        >
          {player.name}
        </div>
        <div className="font-mono text-[10px] text-rpg-textDim mt-0.5">
          {player.activeDays} dias ativos
          {player.constancyBonus > 0 && (
            <span style={{ color: "#A78BFA" }}> · +{player.constancyBonus} bônus</span>
          )}
        </div>

        {/* Barra de progresso */}
        <div
          className="mt-2 h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: colors.bar }}
          />
        </div>
      </div>

      {/* Pontuação */}
      <div className="text-right shrink-0 pl-1 sm:pl-2">
        <div
          className="font-display text-xl sm:text-2xl leading-none"
          style={{
            color: colors.badge,
            textShadow: isTop3 ? `0 0 12px ${colors.badge}60` : "none",
          }}
        >
          {player.rankingPoints}
        </div>
        <div className="font-mono text-[9px] text-rpg-textDim mt-0.5 uppercase tracking-wider2">
          pts
        </div>
      </div>
    </div>
  );
}
