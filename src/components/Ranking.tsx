import { PlayerAvatar } from "./PlayerAvatar";

export interface RankingEntry {
  id: string;
  name: string;
  sector: string | null;
  avatarUrl: string | null;
  primary: string;
  primaryLabel: string;
  secondary?: string;
  meter?: number; // 0..1 barrinha
  accent?: string; // cor
}

export function Ranking({
  title,
  subtitle,
  entries,
  accent = "#FF4655"
}: {
  title: string;
  subtitle: string;
  entries: RankingEntry[];
  accent?: string;
}) {
  return (
    <div className="val-card relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 w-24" style={{ background: accent }} />
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h3 className="val-heading text-xl">{title}</h3>
          <div className="font-mono text-val-line text-xs uppercase tracking-wider2">{subtitle}</div>
        </div>
        <div
          className="font-display uppercase tracking-wider2 text-xs px-2 py-1"
          style={{ color: accent, border: `1px solid ${accent}80` }}
        >
          TOP {entries.length}
        </div>
      </div>

      <div className="space-y-2">
        {entries.map((e, idx) => {
          const pos = idx + 1;
          const isTop = pos === 1;
          return (
            <div
              key={e.id}
              className={`grid grid-cols-[40px_48px_1fr_auto] gap-3 items-center py-2 px-3 border transition-all ${
                isTop
                  ? "border-val-gold/40 bg-val-gold/5"
                  : "border-val-line/10 hover:border-val-line/30"
              }`}
            >
              <div
                className={`font-display text-2xl leading-none ${
                  pos === 1 ? "text-val-gold" :
                  pos === 2 ? "text-[#D4DEE8]" :
                  pos === 3 ? "text-[#D88757]" : "text-val-line"
                }`}
              >
                {String(pos).padStart(2, "0")}
              </div>
              <PlayerAvatar name={e.name} url={e.avatarUrl} size={48} rank={pos} />
              <div className="min-w-0">
                <div className="font-display uppercase tracking-wider2 text-val-cream truncate">{e.name}</div>
                <div className="font-mono text-[11px] text-val-line truncate">
                  {e.sector ? `${e.sector} · ` : ""}{e.secondary || ""}
                </div>
                {typeof e.meter === "number" && (
                  <div className="h-1 mt-1 bg-val-bgDark overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(100, e.meter * 100)}%`,
                        background: e.accent || accent
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-display text-lg text-val-cream leading-tight">{e.primary}</div>
                <div className="font-mono text-[10px] uppercase text-val-line">{e.primaryLabel}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
