import type { MedalTier } from "@/lib/scoring";
import { OrnamentalShield } from "./OrnamentalShield";

const TIER_GLOW: Record<MedalTier, string> = {
  GOLD:   "radial-gradient(circle at 30% 20%, rgba(240,192,48,0.18), transparent 60%)",
  SILVER: "radial-gradient(circle at 30% 20%, rgba(143,168,200,0.14), transparent 60%)",
  BRONZE: "radial-gradient(circle at 30% 20%, rgba(192,112,48,0.14), transparent 60%)",
  NONE:   "radial-gradient(circle at 30% 20%, rgba(124,77,255,0.10), transparent 70%)",
};

export function MedalGauge({
  title,
  subtitle,
  value,
  unit,
  bronze,
  silver,
  gold,
  tier,
  next,
  totalPoints,
  socialAction,
}: {
  title: string;
  subtitle: string;
  value: number;
  unit: string;
  bronze: number;
  silver: number;
  gold: number;
  tier: MedalTier;
  next: { target: number; label: string } | null;
  totalPoints?: number;
  socialAction?: boolean;
}) {
  const pct       = Math.min(100, (value / gold) * 100);
  const bronzePct = (bronze / gold) * 100;
  const silverPct = (silver / gold) * 100;
  const actionUnlocked = socialAction ?? tier === "GOLD";

  return (
    <div
      className="relative overflow-hidden p-4 sm:p-6"
      style={{
        background: "rgba(10,14,32,0.88)",
        border: "1px solid rgba(61,127,255,0.22)",
        backdropFilter: "blur(16px)",
        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)",
      }}
    >
      {/* Faixa de topo colorida */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background:
            tier === "GOLD"   ? "linear-gradient(90deg, transparent, #F0C040, transparent)" :
            tier === "SILVER" ? "linear-gradient(90deg, transparent, #8FA8C8, transparent)" :
            tier === "BRONZE" ? "linear-gradient(90deg, transparent, #C07030, transparent)" :
                                "linear-gradient(90deg, transparent, rgba(124,77,255,0.7), transparent)"
        }}
      />

      {/* Glow de fundo */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: TIER_GLOW[tier] }} />

      <div className="relative flex flex-col md:flex-row items-stretch md:items-start gap-6">
        {/* Escudo + Pedestal + Ação Social */}
        <div className="flex flex-col items-center shrink-0 w-full max-w-[260px] mx-auto md:max-w-none md:mx-0 md:w-auto" style={{ gap: 0 }}>

          {/* ── Escudo ornamental com animação ── */}
          <div className={
            tier === "GOLD"   ? "animate-glow-gold animate-float" :
            tier === "SILVER" ? "animate-glow-silver animate-float" :
            tier === "BRONZE" ? "animate-glow-bronze animate-float" :
                                "animate-float"
          }>
            <OrnamentalShield tier={tier} size={110} />
          </div>

          {/* ── Pedestal volumétrico ── */}
          <div className="relative w-full" style={{ marginTop: 2 }}>
            {/* Glow de baixo do pedestal */}
            <div style={{
              position: "absolute", bottom: -10, left: "15%", right: "15%", height: 20,
              background: tier === "NONE"
                ? "radial-gradient(ellipse at 50% 0%, rgba(124,77,255,0.45), transparent 70%)"
                : tier === "GOLD"   ? "radial-gradient(ellipse at 50% 0%, rgba(240,192,48,0.5), transparent 70%)"
                : tier === "SILVER" ? "radial-gradient(ellipse at 50% 0%, rgba(143,168,200,0.4), transparent 70%)"
                :                     "radial-gradient(ellipse at 50% 0%, rgba(192,112,48,0.4), transparent 70%)",
              filter: "blur(6px)", pointerEvents: "none",
            }} />
            {/* Linha superior iluminada */}
            <div style={{
              height: 3,
              background: tier === "NONE"
                ? "linear-gradient(90deg, transparent, rgba(124,77,255,0.9), rgba(61,127,255,0.9), transparent)"
                : tier === "GOLD"   ? "linear-gradient(90deg, transparent, #C8960C, #F0C040, #C8960C, transparent)"
                : tier === "SILVER" ? "linear-gradient(90deg, transparent, #8FA8C8, #C8D8E8, #8FA8C8, transparent)"
                :                     "linear-gradient(90deg, transparent, #804820, #C07030, #804820, transparent)",
              boxShadow: tier === "NONE"
                ? "0 0 8px rgba(124,77,255,0.7), 0 0 20px rgba(61,127,255,0.4)"
                : tier === "GOLD"   ? "0 0 8px rgba(240,192,48,0.8), 0 0 20px rgba(240,192,48,0.4)"
                : tier === "SILVER" ? "0 0 8px rgba(200,216,232,0.6)"
                :                     "0 0 8px rgba(192,112,48,0.6)",
            }} />
            {/* Corpo do pedestal */}
            <div style={{
              height: 28,
              background: tier === "NONE"
                ? "linear-gradient(180deg, rgba(40,30,80,0.95) 0%, rgba(10,14,32,0.98) 100%)"
                : tier === "GOLD"   ? "linear-gradient(180deg, rgba(60,40,0,0.95) 0%, rgba(10,8,0,0.98) 100%)"
                : tier === "SILVER" ? "linear-gradient(180deg, rgba(30,40,55,0.95) 0%, rgba(8,12,20,0.98) 100%)"
                :                     "linear-gradient(180deg, rgba(50,25,5,0.95) 0%, rgba(10,5,0,0.98) 100%)",
              borderLeft:   "1px solid rgba(255,255,255,0.07)",
              borderRight:  "1px solid rgba(255,255,255,0.07)",
              borderBottom: "1px solid rgba(0,0,0,0.6)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            }}>
              <span style={{
                fontFamily: "var(--font-display), Impact, sans-serif",
                fontSize: 9, letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: tier === "NONE" ? "#A78BFA" : tier === "GOLD" ? "#F0C040" : tier === "SILVER" ? "#8FA8C8" : "#C07030",
                textShadow: tier === "NONE"
                  ? "0 0 8px rgba(167,139,250,0.6)"
                  : tier === "GOLD" ? "0 0 8px rgba(240,192,48,0.6)"
                  : tier === "SILVER" ? "0 0 6px rgba(143,168,200,0.5)"
                  : "0 0 6px rgba(192,112,48,0.5)",
              }}>
                {tier === "NONE" ? "Sem Escudo" : tier === "GOLD" ? "Ouro" : tier === "SILVER" ? "Prata" : "Bronze"}
              </span>
            </div>
            {/* Face frontal escura (profundidade) */}
            <div style={{
              height: 5,
              background: "linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
              borderLeft:  "1px solid rgba(255,255,255,0.03)",
              borderRight: "1px solid rgba(255,255,255,0.03)",
            }} />
          </div>

          {/* ── Ação Social ── */}
          <div className="w-full mt-3">
            {actionUnlocked ? (
              /* DESBLOQUEADA */
              <div
                className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-wider2"
                style={{
                  background: "rgba(45,212,191,0.08)",
                  border: "1px solid rgba(45,212,191,0.30)",
                  color: "#2DD4BF",
                }}
              >
                <span style={{ fontSize: 13 }}>✦</span>
                <div>
                  <div>Ação Social</div>
                  <div className="text-[9px] opacity-70 normal-case">Desbloqueada</div>
                </div>
              </div>
            ) : (
              /* BLOQUEADA */
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

                {/* Linha: cadeado + título */}
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
                    <div className="font-mono uppercase tracking-wider2"
                      style={{ fontSize: 8, color: "rgba(255,110,110,0.65)" }}>
                      Bloqueada
                    </div>
                  </div>
                </div>

                {/* Motivação compacta */}
                <div className="font-mono"
                  style={{ fontSize: 8, color: "rgba(230,170,80,0.80)", letterSpacing: "0.03em", lineHeight: 1.4 }}>
                  Atinja o escudo{" "}
                  <span style={{ color: "#F0C040", fontWeight: "bold" }}>OURO</span>{" "}
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

          {/* Números */}
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
                  <span
                    className="font-display text-2xl sm:text-3xl"
                    style={{ color: "#A78BFA", textShadow: "0 0 12px rgba(167,139,250,0.5)" }}
                  >
                    {totalPoints.toLocaleString("pt-BR")}
                  </span>
                  <span className="font-mono text-rpg-textDim text-xs">pts</span>
                </div>
              </div>
            )}
          </div>

          <div className="font-mono text-xs text-rpg-textDim mt-1">
            {next
              ? `faltam ${next.target - value} dias para o escudo ${next.label}`
              : "🏆 Escudo Ouro conquistado · coletivo completo"}
          </div>

          {/* Barra de progresso */}
          <div
            className="mt-4 relative h-4 overflow-hidden"
            style={{
              background: "rgba(6,9,26,0.8)",
              border: "1px solid rgba(61,127,255,0.2)",
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
            }}
          >
            <div
              className="absolute inset-y-0 left-0 transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #C07030 0%, #8FA8C8 50%, #F0C040 100%)",
                opacity: 0.85,
              }}
            />
            {/* Markers */}
            {[bronzePct, silverPct].map((p, i) => (
              <div
                key={i}
                className="absolute inset-y-0 flex items-center"
                style={{ left: `${p}%` }}
              >
                <div className="w-px h-full bg-white/40" />
              </div>
            ))}
          </div>

          {/* Labels escudos */}
          <div className="grid grid-cols-3 mt-2 font-mono text-[10px] uppercase tracking-wider2">
            <span style={{ color: "#C07030" }}>◆ Bronze {bronze}</span>
            <span className="text-center" style={{ color: "#8FA8C8" }}>◆ Prata {silver}</span>
            <span className="text-right" style={{ color: "#F0C040" }}>◆ Ouro {gold}</span>
          </div>

          <div className="mt-2 font-mono text-[9px] text-rpg-textDim uppercase tracking-wider2 opacity-60">
            6 pessoas · 31 dias · jun–jul 2026
          </div>
        </div>
      </div>
    </div>
  );
}
