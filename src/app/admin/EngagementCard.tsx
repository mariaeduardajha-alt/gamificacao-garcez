"use client";

import { useState } from "react";

export interface PlayerEngagement {
  userId: string;
  name: string;
  avatarUrl: string | null;
  currentWeekDays: number;   // dias ativos na semana atual
  onTrack: boolean;          // ≥3 dias esta semana
  weeksHitGoal: number;      // semanas com ≥3 dias no total
  totalWeeks: number;        // semanas decorridas do desafio
  activeDays: number;        // total de dias ativos
}

const TIPS = [
  { icon: "⚔", text: "Marque um horário fixo de grupo: uma manhã ou almoço semanal para atividade juntos gera compromisso e pertencimento." },
  { icon: "🏆", text: "Compartilhe o placar no grupo: ver o ranking ao vivo cria pressão positiva e aumenta a frequência espontaneamente." },
  { icon: "💬", text: "Reconheça publicamente quem completou a semana com ≥3 dias — elogio social é o melhor motivador de curto prazo." },
  { icon: "🎯", text: "Desafio interno: quem bater a meta por 2 semanas seguidas ganha escolher a atividade da semana seguinte." },
  { icon: "📅", text: "Lembrete na segunda-feira: envie um aviso no grupo com os dias restantes e a posição de cada um no ranking." },
];

export function EngagementCard({ players }: { players: PlayerEngagement[] }) {
  const [tipsOpen, setTipsOpen] = useState(false);

  const onTrackCount = players.filter((p) => p.onTrack).length;
  const total        = players.length;
  const pct          = total > 0 ? Math.round((onTrackCount / total) * 100) : 0;

  const statusColor =
    pct >= 80 ? "#2DD4BF" :
    pct >= 50 ? "#F0C040" :
                "#FF4655";

  return (
    <div className="space-y-4">

      {/* Cabeçalho resumo */}
      <div
        className="relative overflow-hidden p-5"
        style={{
          background: "rgba(10,14,32,0.88)",
          border: "1px solid rgba(61,127,255,0.22)",
          backdropFilter: "blur(16px)",
          clipPath: "polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg,transparent,${statusColor},transparent)` }} />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim mb-1">
              Semana atual · meta ≥3 dias ativos
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold" style={{ color: statusColor }}>
                {onTrackCount}/{total}
              </span>
              <span className="font-mono text-sm text-rpg-textDim">agentes no ritmo</span>
            </div>
          </div>

          {/* Barra geral */}
          <div className="flex-1 min-w-[160px] max-w-xs">
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim mb-1">
              <span>Engajamento</span>
              <span style={{ color: statusColor }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: statusColor, boxShadow: `0 0 8px ${statusColor}80` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Lista por agente */}
      <div className="val-card p-0 overflow-hidden">
        {/* ── Desktop: tabela ── */}
        <table className="w-full hidden md:table">
          <thead>
            <tr className="border-b border-val-line/30">
              <th className="px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line">Agente</th>
              <th className="px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line">Semana atual</th>
              <th className="px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line">Semanas na meta</th>
              <th className="px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line">Dias ativos</th>
              <th className="px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line">Status</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.userId} className="border-b border-val-line/10 hover:bg-val-bgDark/40">

                {/* Agente */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                      style={{ background: "rgba(13,19,48,0.8)", border: "1px solid rgba(61,127,255,0.25)" }}>
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt={p.name}
                          className="w-full h-full object-cover" style={{ objectPosition: "center 15%" }} />
                      ) : (
                        <span style={{ fontSize: 10, color: "#3D7FFF", fontWeight: 700 }}>
                          {p.name.split(" ").slice(0,2).map(n => n[0]).join("").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-display uppercase tracking-wider2 text-xs text-val-cream">
                      {p.name.split(" ")[0]}
                    </span>
                  </div>
                </td>

                {/* Dots da semana atual (máx 3 para a meta) */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="w-3 h-3 rounded-full"
                        style={{
                          background: p.currentWeekDays >= n
                            ? (p.onTrack ? "#2DD4BF" : "#F0C040")
                            : "rgba(255,255,255,0.08)",
                          boxShadow: p.currentWeekDays >= n
                            ? `0 0 6px ${p.onTrack ? "#2DD4BF" : "#F0C040"}90`
                            : "none",
                          border: p.currentWeekDays >= n ? "none" : "1px solid rgba(255,255,255,0.12)",
                        }} />
                    ))}
                    {p.currentWeekDays > 3 && (
                      <span className="font-mono text-[9px]" style={{ color: "#2DD4BF" }}>
                        +{p.currentWeekDays - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Semanas na meta */}
                <td className="px-4 py-3">
                  <span className="font-display text-lg" style={{ color: "#A78BFA" }}>
                    {p.weeksHitGoal}
                  </span>
                  <span className="font-mono text-[10px] text-rpg-textDim ml-1">
                    / {p.totalWeeks} sem.
                  </span>
                </td>

                {/* Dias ativos */}
                <td className="px-4 py-3 font-display text-lg text-val-cream">
                  {p.activeDays}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {p.onTrack ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5"
                      style={{ color: "#2DD4BF", background: "rgba(45,212,191,0.10)", border: "1px solid rgba(45,212,191,0.30)" }}>
                      ✦ No ritmo
                    </span>
                  ) : p.currentWeekDays > 0 ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5"
                      style={{ color: "#F0C040", background: "rgba(240,192,48,0.10)", border: "1px solid rgba(240,192,48,0.30)" }}>
                      ⚡ Em progresso
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5"
                      style={{ color: "#FF4655", background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.25)" }}>
                      ✕ Sem ativ.
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Mobile: lista de cards ── */}
        <div className="md:hidden divide-y divide-val-line/10">
          {players.map((p) => (
            <div key={p.userId} className="px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                style={{ background: "rgba(13,19,48,0.8)", border: "1px solid rgba(61,127,255,0.25)" }}>
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt={p.name}
                    className="w-full h-full object-cover" style={{ objectPosition: "center 15%" }} />
                ) : (
                  <span style={{ fontSize: 11, color: "#3D7FFF", fontWeight: 700 }}>
                    {p.name.split(" ").slice(0,2).map(n => n[0]).join("").toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display uppercase tracking-wider2 text-sm text-val-cream truncate">
                    {p.name.split(" ")[0]}
                  </span>
                  {p.onTrack ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5 shrink-0"
                      style={{ color: "#2DD4BF", background: "rgba(45,212,191,0.10)", border: "1px solid rgba(45,212,191,0.30)" }}>
                      ✦ No ritmo
                    </span>
                  ) : p.currentWeekDays > 0 ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5 shrink-0"
                      style={{ color: "#F0C040", background: "rgba(240,192,48,0.10)", border: "1px solid rgba(240,192,48,0.30)" }}>
                      ⚡ Progresso
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5 shrink-0"
                      style={{ color: "#FF4655", background: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.25)" }}>
                      ✕ Sem ativ.
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-rpg-textDim">
                  <span className="flex items-center gap-1">
                    Semana:
                    <span className="flex items-center gap-1">
                      {[1, 2, 3].map((n) => (
                        <span key={n} className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{
                            background: p.currentWeekDays >= n ? (p.onTrack ? "#2DD4BF" : "#F0C040") : "rgba(255,255,255,0.08)",
                            border: p.currentWeekDays >= n ? "none" : "1px solid rgba(255,255,255,0.12)",
                          }} />
                      ))}
                    </span>
                  </span>
                  <span style={{ color: "#A78BFA" }}>Meta {p.weeksHitGoal}/{p.totalWeeks}</span>
                  <span className="text-val-cream">Dias {p.activeDays}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dicas de engajamento */}
      <div
        className="overflow-hidden"
        style={{
          background: "rgba(10,14,32,0.7)",
          border: "1px solid rgba(124,77,255,0.20)",
        }}
      >
        <button
          onClick={() => setTipsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span style={{ color: "#A78BFA" }}>
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 6v5M10 14v.5" />
              </svg>
            </span>
            <span className="font-display uppercase tracking-wider2 text-xs text-val-cream">
              Dicas para engajar a equipe
            </span>
          </div>
          <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round"
            style={{
              color: "rgba(167,139,250,0.6)",
              transform: tipsOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.25s",
            }}>
            <path d="M1.5 4l4.5 4.5L10.5 4" />
          </svg>
        </button>

        {tipsOpen && (
          <div className="px-5 pb-4 space-y-3"
            style={{ borderTop: "1px solid rgba(124,77,255,0.12)" }}>
            <div className="pt-3" />
            {TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
                <p className="font-mono text-xs text-rpg-textDim leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
