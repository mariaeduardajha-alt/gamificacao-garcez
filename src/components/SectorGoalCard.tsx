import type { GoalDirection } from "@prisma/client";
import type { SectorGoalData } from "@/lib/challenge";
import { TIER_COLOR, TIER_LABEL } from "@/lib/tiers";
import { MedalBadge } from "./MedalBadge";
import { Avatar } from "./Avatar";

function formatValue(value: number, unit: string): string {
  if (value === 0) return "–";
  if (unit === "min") {
    const h = Math.floor(value / 60);
    const m = value % 60;
    return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, "0") : ""}` : `${m}min`;
  }
  return value.toLocaleString("pt-BR", { minimumFractionDigits: value % 1 !== 0 ? 1 : 0 });
}

function formatGap(gap: number, unit: string, direction: GoalDirection): string {
  const prefix = direction === "HIGHER_IS_BETTER" ? "faltam " : "reduzir ";
  return `${prefix}${formatValue(gap, unit)} ${unit}`;
}

/** Card de meta de um setor: escudo atual, responsável, indicador e quanto falta. */
export function SectorGoalCard({ goal }: { goal: SectorGoalData }) {
  const { tier, next, unit, direction } = goal;
  const color = tier === "NONE" ? "#3D7FFF" : TIER_COLOR[tier];

  return (
    <div
      className="relative overflow-hidden flex flex-col gap-3 clip-notch-sm"
      style={{
        background: `radial-gradient(circle at 50% -10%, ${color}30, transparent 65%), rgba(10,14,32,0.88)`,
        border: `1px solid ${color}50`,
        backdropFilter: "blur(12px)",
        padding: "1.25rem",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      {/* Escudo + responsável */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <MedalBadge tier={tier} size={64} />
        <span className="font-display uppercase tracking-wider2 text-xs" style={{ color }}>
          {TIER_LABEL[tier]}
        </span>

        <Avatar
          name={goal.responsible}
          url={goal.avatarUrl}
          size={56}
          initialsColor={color}
          className="mt-1"
          style={{ border: `2px solid ${color}50`, boxShadow: `0 0 12px ${color}50` }}
        />

        <div className="font-display uppercase tracking-wider2 text-sm text-center" style={{ color }}>
          {goal.responsible}
        </div>

        <div
          className="font-mono text-[9px] uppercase tracking-wider2 px-2 py-0.5 rounded-sm"
          style={{ color: "#C9A84C", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)" }}
        >
          {goal.area}
        </div>
      </div>

      <div className="rpg-divider" />

      {/* Indicador */}
      <div>
        <div className="font-mono text-[9px] uppercase tracking-wider2 text-rpg-textDim mb-1">Indicador</div>
        <div className="font-display text-val-cream text-xs leading-snug">{goal.indicator}</div>
      </div>

      {/* Resultado atual */}
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl" style={{ color, textShadow: `0 0 10px ${color}50` }}>
          {formatValue(goal.current, unit)}
        </span>
        <span className="font-mono text-rpg-textDim text-xs">{unit}</span>
      </div>

      {/* Metas por escudo */}
      <div
        className="grid grid-cols-3 gap-1 font-mono text-[9px] uppercase tracking-wider2 py-2"
        style={{ borderTop: "1px solid rgba(61,127,255,0.10)", borderBottom: "1px solid rgba(61,127,255,0.10)" }}
      >
        {(["BRONZE", "SILVER", "GOLD"] as const).map((t) => (
          <div key={t} className="flex flex-col items-center gap-0.5">
            <span style={{ color: TIER_COLOR[t] }}>{TIER_LABEL[t]}</span>
            <span className="text-val-cream">{formatValue(goal[t.toLowerCase() as "bronze" | "silver" | "gold"], unit)}</span>
          </div>
        ))}
      </div>

      {/* Quanto falta */}
      <div className="font-mono text-xs">
        {next ? (
          <span style={{ color: "rgba(90,106,138,0.9)" }}>
            Para <span style={{ color: TIER_COLOR[next.tier] }}>{TIER_LABEL[next.tier].toUpperCase()}</span>
            : {formatGap(next.gap, unit, direction)}
          </span>
        ) : (
          <span style={{ color: TIER_COLOR.GOLD }}>🏆 Meta Ouro atingida!</span>
        )}
      </div>
    </div>
  );
}
