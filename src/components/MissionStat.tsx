import type { ReactNode } from "react";

export function MissionStat({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className="px-3 py-2 flex items-center gap-2"
      style={{
        background: "rgba(13,19,48,0.6)",
        border: `1px solid ${color}30`,
      }}
    >
      <span style={{ color, flexShrink: 0 }}>{icon}</span>
      <div>
        <div className="font-display text-lg leading-none" style={{ color }}>{value}</div>
        <div className="font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim mt-0.5">{label}</div>
      </div>
    </div>
  );
}
