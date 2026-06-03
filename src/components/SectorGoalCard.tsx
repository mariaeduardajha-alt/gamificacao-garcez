import type { MedalTier } from "@/lib/scoring";
import { Shield } from "./Shield";
import type { SectorGoalData } from "@/lib/challenge";

function formatValue(value: number, unit: string): string {
  if (unit === "min") {
    if (value === 0) return "–";
    const h = Math.floor(value / 60);
    const m = value % 60;
    return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, "0") : ""}` : `${m}min`;
  }
  if (unit === "pts" || unit === "meses") {
    return value === 0
      ? "–"
      : value.toLocaleString("pt-BR", { minimumFractionDigits: value % 1 !== 0 ? 1 : 0 });
  }
  return value === 0 ? "–" : value.toLocaleString("pt-BR");
}

function formatGap(gap: number, unit: string, direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER"): string {
  const prefix = direction === "HIGHER_IS_BETTER" ? "faltam " : "reduzir ";
  return `${prefix}${formatValue(gap, unit)} ${unit}`;
}

const TIER_STYLES: Record<MedalTier, {
  topGlow: string;
  borderColor: string;
  topBar: string;
  initials: string;
}> = {
  GOLD: {
    topGlow:     "radial-gradient(circle at 50% -10%, rgba(240,192,48,0.22), transparent 65%)",
    borderColor: "rgba(240,192,48,0.35)",
    topBar:      "linear-gradient(90deg, transparent, #F0C040, transparent)",
    initials:    "#F0C040",
  },
  SILVER: {
    topGlow:     "radial-gradient(circle at 50% -10%, rgba(143,168,200,0.18), transparent 65%)",
    borderColor: "rgba(143,168,200,0.30)",
    topBar:      "linear-gradient(90deg, transparent, #8FA8C8, transparent)",
    initials:    "#8FA8C8",
  },
  BRONZE: {
    topGlow:     "radial-gradient(circle at 50% -10%, rgba(192,112,48,0.18), transparent 65%)",
    borderColor: "rgba(192,112,48,0.30)",
    topBar:      "linear-gradient(90deg, transparent, #C07030, transparent)",
    initials:    "#C07030",
  },
  NONE: {
    topGlow:     "radial-gradient(circle at 50% -10%, rgba(61,127,255,0.08), transparent 65%)",
    borderColor: "rgba(61,127,255,0.18)",
    topBar:      "linear-gradient(90deg, transparent, rgba(61,127,255,0.4), transparent)",
    initials:    "#3D7FFF",
  },
};

export function SectorGoalCard({ goal }: { goal: SectorGoalData }) {
  const { tier, nextLabel, gap, unit, direction } = goal;
  const styles = TIER_STYLES[tier];

  return (
    <div
      className="relative overflow-hidden flex flex-col gap-3"
      style={{
        background: `${styles.topGlow}, rgba(10,14,32,0.88)`,
        border: `1px solid ${styles.borderColor}`,
        backdropFilter: "blur(12px)",
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
        padding: "1.25rem",
      }}
    >
      {/* Barra de topo colorida */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: styles.topBar }}
      />

      {/* Escudo */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <Shield tier={tier} size={70} showLabel />

        {/* Avatar circular */}
        <div
          className="mt-1 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: 56, height: 56,
            background: "rgba(13,19,48,0.9)",
            border: `2px solid ${styles.borderColor}`,
            boxShadow: `0 0 12px ${styles.borderColor}`,
          }}
        >
          {goal.avatarUrl ? (
            <img
              src={goal.avatarUrl}
              alt={goal.responsible}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }}
            />
          ) : (
            <span
              className="font-display uppercase"
              style={{ fontSize: 18, color: styles.initials, letterSpacing: "0.05em" }}
            >
              {goal.responsible.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Nome */}
        <div
          className="font-display uppercase tracking-wider2 text-sm text-center"
          style={{ color: styles.initials }}
        >
          {goal.responsible}
        </div>

        {/* Badge da área */}
        <div
          className="font-mono text-[9px] uppercase tracking-wider2 px-2 py-0.5 rounded-sm"
          style={{
            color: "#C9A84C",
            background: "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.25)",
          }}
        >
          {goal.area}
        </div>
      </div>

      {/* Divider */}
      <div className="rpg-divider" />

      {/* Indicador */}
      <div>
        <div className="font-mono text-[9px] uppercase tracking-wider2 text-rpg-textDim mb-1">
          Indicador
        </div>
        <div className="font-display text-val-cream text-xs leading-snug">
          {goal.indicator}
        </div>
      </div>

      {/* Resultado atual */}
      <div className="flex items-baseline gap-2">
        <span
          className="font-display text-3xl"
          style={{ color: styles.initials, textShadow: `0 0 10px ${styles.borderColor}` }}
        >
          {formatValue(goal.current, unit)}
        </span>
        <span className="font-mono text-rpg-textDim text-xs">{unit}</span>
      </div>

      {/* Metas por escudo */}
      <div
        className="grid grid-cols-3 gap-1 font-mono text-[9px] uppercase tracking-wider2 py-2"
        style={{ borderTop: "1px solid rgba(61,127,255,0.10)", borderBottom: "1px solid rgba(61,127,255,0.10)" }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span style={{ color: "#C07030" }}>Bronze</span>
          <span className="text-val-cream">{formatValue(goal.bronze, unit)}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span style={{ color: "#8FA8C8" }}>Prata</span>
          <span className="text-val-cream">{formatValue(goal.silver, unit)}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span style={{ color: "#F0C040" }}>Ouro</span>
          <span className="text-val-cream">{formatValue(goal.gold, unit)}</span>
        </div>
      </div>

      {/* Quanto falta */}
      <div className="font-mono text-xs">
        {nextLabel && gap !== null ? (
          <span style={{ color: "rgba(90,106,138,0.9)" }}>
            Para{" "}
            <span
              style={{
                color:
                  nextLabel === "OURO"  ? "#F0C040" :
                  nextLabel === "PRATA" ? "#8FA8C8" : "#C07030"
              }}
            >
              {nextLabel}
            </span>
            : {formatGap(gap, unit, direction)}
          </span>
        ) : (
          <span style={{ color: "#F0C040" }}>🏆 Meta Ouro atingida!</span>
        )}
      </div>
    </div>
  );
}
