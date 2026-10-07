import type { MedalTier, NextTier } from "@/lib/scoring";
import { TIER_COLOR, TIER_LABEL, TIER_GLOW_ANIMATION } from "@/lib/tiers";
import { MedalBadge } from "./MedalBadge";

/** Meta coletiva: escudo da equipe no pedestal + números + barra até o Ouro. */
export function MedalGauge({
  title,
  subtitle,
  footer,
  value,
  unit,
  bronze,
  silver,
  gold,
  tier,
  next,
  totalPoints,
}: {
  title: string;
  subtitle: string;
  footer: string;
  value: number;
  unit: string;
  bronze: number;
  silver: number;
  gold: number;
  tier: MedalTier;
  next: NextTier | null;
  totalPoints?: number;
}) {
  const c = TIER_COLOR[tier];
  const pct       = Math.min(100, (value / gold) * 100);
  const bronzePct = (bronze / gold) * 100;
  const silverPct = (silver / gold) * 100;
  // A Ação Social só é desbloqueada com o escudo Ouro da equipe
  const actionUnlocked = tier === "GOLD";

  return (
    <div
      className="relative overflow-hidden p-4 sm:p-6 clip-notch"
      style={{
        background: "rgba(10,14,32,0.88)",
        border: "1px solid rgba(61,127,255,0.22)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Faixa de topo e brilho de fundo na cor do escudo */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${c}, transparent)` }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 20%, ${c}24, transparent 60%)` }} />

      <div className="relative flex flex-col md:flex-row items-stretch md:items-start gap-6">
        {/* Escudo + Pedestal + Ação Social */}
        <div className="flex flex-col items-center shrink-0 w-full max-w-[260px] mx-auto md:max-w-none md:mx-0 md:w-auto">

          <div className={`${TIER_GLOW_ANIMATION[tier]} animate-float`}>
            <MedalBadge tier={tier} size={110} />
          </div>

          {/* Pedestal */}
          <div className="relative w-full" style={{ marginTop: 2 }}>
            <div style={{
              position: "absolute", bottom: -10, left: "15%", right: "15%", height: 20,
              background: `radial-gradient(ellipse at 50% 0%, ${c}73, transparent 70%)`,
              filter: "blur(6px)", pointerEvents: "none",
            }} />
            <div style={{
              height: 3,
              background: `linear-gradient(90deg, transparent, ${c}99, ${c}, ${c}99, transparent)`,
              boxShadow: `0 0 8px ${c}B3, 0 0 20px ${c}66`,
            }} />
            <div style={{
              height: 28,
              background: `linear-gradient(180deg, ${c}26 0%, rgba(10,14,32,0.98) 100%)`,
              borderLeft:   "1px solid rgba(255,255,255,0.07)",
              borderRight:  "1px solid rgba(255,255,255,0.07)",
              borderBottom: "1px solid rgba(0,0,0,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="font-display uppercase" style={{
                fontSize: 9, letterSpacing: "0.22em", color: c, textShadow: `0 0 8px ${c}99`,
              }}>
                {TIER_LABEL[tier]}
              </span>
            </div>
            <div style={{
              height: 5,
              background: "linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
              borderLeft:  "1px solid rgba(255,255,255,0.03)",
              borderRight: "1px solid rgba(255,255,255,0.03)",
            }} />
          </div>

          {/* Ação Social */}
          <div className="w-full mt-3">
            {actionUnlocked ? (
              <div
                className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-wider2"
                style={{ background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.30)", color: "#2DD4BF" }}
              >
                <span style={{ fontSize: 13 }}>✦</span>
                <div>
                  <div>Ação Social</div>
                  <div className="text-[9px] opacity-70 normal-case">Desbloqueada</div>
                </div>
              </div>
            ) : (
              <div
                className="relative overflow-hidden px-3 py-2"
                style={{
                  background: "linear-gradient(135deg, rgba(55,8,8,0.88), rgba(18,5,28,0.92))",
                  border: "1px solid rgba(255,70,85,0.30)",
                  boxShadow: "0 0 14px rgba(255,50,50,0.12), inset 0 0 14px rgba(255,30,30,0.04)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,70,85,0.7), transparent)"
                }} />

                <div className="flex items-center gap-2" style={{ marginBottom: 5 }}>
                  <div className="animate-pulse-blue" style={{ flexShrink: 0 }}>
                    <svg viewBox="0 0 22 27" width="18" height="21" fill="none">
                      <path d="M5.5 11 L5.5 6.5 C5.5 3.5 8 1 11 1 C14 1 16.5 3.5 16.5 6.5 L16.5 11"
                        stroke="#FF6B6B" strokeWidth="1.8" strokeLinecap="round"/>
                      <rect x="2" y="11" width="18" height="14" rx="2.8"
                        fill="rgba(100,15,15,0.5)" stroke="#FF4655" strokeWidth="1.3"/>
                      <circle cx="11" cy="17.5" r="2.5" stroke="#FF6B6B" strokeWidth="1.1" fill="rgba(255,70,85,0.10)"/>
                      <rect x="10.1" y="18.5" width="1.8" height="3.2" rx="0.9" fill="#FF6B6B" opacity="0.8"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-display uppercase tracking-wider2"
                      style={{ fontSize: 10, color: "#FF4655", textShadow: "0 0 8px rgba(255,70,85,0.5)" }}>
                      Ação Social
                    </div>
                    <div className="font-mono uppercase tracking-wider2" style={{ fontSize: 8, color: "rgba(255,110,110,0.65)" }}>
                      Bloqueada
                    </div>
                  </div>
                </div>

                <div className="font-mono" style={{ fontSize: 8, color: "rgba(230,170,80,0.80)", letterSpacing: "0.03em", lineHeight: 1.4 }}>
                  Atinja o escudo{" "}
                  <span style={{ color: TIER_COLOR.GOLD, fontWeight: "bold" }}>OURO</span>{" "}
                  para desbloquear
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dados */}
        <div className="flex-1 min-w-0 w-full text-center md:text-left">
          <div className="font-mono text-xs uppercase tracking-wider2 text-rpg-textDim">{subtitle}</div>
          <h2 className="val-heading text-xl sm:text-2xl mt-0.5">{title}</h2>

          <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim">Dias ativos</div>
              <div className="flex items-baseline gap-1 justify-center md:justify-start">
                <span className="font-display text-3xl sm:text-4xl text-val-cream">{value}</span>
                <span className="font-mono text-rpg-textDim text-sm">{unit}</span>
              </div>
            </div>
            {typeof totalPoints === "number" && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim">Pts coletivos</div>
                <div className="flex items-baseline gap-1 justify-center md:justify-start">
                  <span className="font-display text-2xl sm:text-3xl"
                    style={{ color: "#A78BFA", textShadow: "0 0 12px rgba(167,139,250,0.5)" }}>
                    {totalPoints.toLocaleString("pt-BR")}
                  </span>
                  <span className="font-mono text-rpg-textDim text-xs">pts</span>
                </div>
              </div>
            )}
          </div>

          <div className="font-mono text-xs text-rpg-textDim mt-1">
            {next
              ? `faltam ${next.gap} dias para o escudo ${TIER_LABEL[next.tier].toUpperCase()}`
              : "🏆 Escudo Ouro conquistado · coletivo completo"}
          </div>

          {/* Barra de progresso */}
          <div className="mt-4 relative h-4 overflow-hidden clip-notch-xs"
            style={{ background: "rgba(6,9,26,0.8)", border: "1px solid rgba(61,127,255,0.2)" }}>
            <div
              className="absolute inset-y-0 left-0 transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${TIER_COLOR.BRONZE} 0%, ${TIER_COLOR.SILVER} 50%, ${TIER_COLOR.GOLD} 100%)`,
                opacity: 0.85,
              }}
            />
            {[bronzePct, silverPct].map((p, i) => (
              <div key={i} className="absolute inset-y-0 w-px bg-white/40" style={{ left: `${p}%` }} />
            ))}
          </div>

          <div className="grid grid-cols-3 mt-2 font-mono text-[10px] uppercase tracking-wider2">
            <span style={{ color: TIER_COLOR.BRONZE }}>◆ Bronze {bronze}</span>
            <span className="text-center" style={{ color: TIER_COLOR.SILVER }}>◆ Prata {silver}</span>
            <span className="text-right" style={{ color: TIER_COLOR.GOLD }}>◆ Ouro {gold}</span>
          </div>

          <div className="mt-2 font-mono text-[9px] text-rpg-textDim uppercase tracking-wider2 opacity-60">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
