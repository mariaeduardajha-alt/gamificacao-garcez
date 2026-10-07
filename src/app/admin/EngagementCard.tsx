"use client";

import { useState } from "react";
import { WEEKLY_GOAL_DAYS } from "@/lib/game-rules";
import { firstName } from "@/lib/format";
import { Th } from "@/components/table/Table";
import { Avatar } from "@/components/Avatar";
import { ChevronIcon } from "@/components/icons";

export interface PlayerEngagement {
  userId: string;
  name: string;
  avatarUrl: string | null;
  currentWeekDays: number;   // dias ativos na semana atual
  onTrack: boolean;          // bateu a meta semanal esta semana
  weeksHitGoal: number;      // semanas com meta batida no total
  totalWeeks: number;        // semanas decorridas do desafio
  activeDays: number;        // total de dias ativos
}

const TIPS = [
  { icon: "⚔", text: "Marque um horário fixo de grupo: uma manhã ou almoço semanal para atividade juntos gera compromisso e pertencimento." },
  { icon: "🏆", text: "Compartilhe o placar no grupo: ver o ranking ao vivo cria pressão positiva e aumenta a frequência espontaneamente." },
  { icon: "💬", text: `Reconheça publicamente quem completou a semana com ≥${WEEKLY_GOAL_DAYS} dias — elogio social é o melhor motivador de curto prazo.` },
  { icon: "🎯", text: "Desafio interno: quem bater a meta por 2 semanas seguidas ganha escolher a atividade da semana seguinte." },
  { icon: "📅", text: "Lembrete na segunda-feira: envie um aviso no grupo com os dias restantes e a posição de cada um no ranking." },
];

const COLOR_ON_TRACK = "#2DD4BF";
const COLOR_PROGRESS = "#F0C040";
const COLOR_IDLE     = "#FF4655";

/** Painel admin: quem está no ritmo da meta semanal e dicas de engajamento. */
export function EngagementCard({ players }: { players: PlayerEngagement[] }) {
  const [tipsOpen, setTipsOpen] = useState(false);

  const onTrackCount = players.filter((p) => p.onTrack).length;
  const total        = players.length;
  const pct          = total > 0 ? Math.round((onTrackCount / total) * 100) : 0;
  const statusColor  = pct >= 80 ? COLOR_ON_TRACK : pct >= 50 ? COLOR_PROGRESS : COLOR_IDLE;

  return (
    <div className="space-y-4">

      {/* Cabeçalho resumo */}
      <div
        className="relative overflow-hidden p-5 clip-notch-sm"
        style={{ background: "rgba(10,14,32,0.88)", border: "1px solid rgba(61,127,255,0.22)", backdropFilter: "blur(16px)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg,transparent,${statusColor},transparent)` }} />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim mb-1">
              Semana atual · meta ≥{WEEKLY_GOAL_DAYS} dias ativos
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold" style={{ color: statusColor }}>
                {onTrackCount}/{total}
              </span>
              <span className="font-mono text-sm text-rpg-textDim">agentes no ritmo</span>
            </div>
          </div>

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
              <Th>Agente</Th>
              <Th>Semana atual</Th>
              <Th>Semanas na meta</Th>
              <Th>Dias ativos</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.userId} className="border-b border-val-line/10 hover:bg-val-bgDark/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar player={p} size={28} />
                    <span className="font-display uppercase tracking-wider2 text-xs text-val-cream">{firstName(p.name)}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><WeekDots player={p} size={12} /></td>
                <td className="px-4 py-3">
                  <span className="font-display text-lg" style={{ color: "#A78BFA" }}>{p.weeksHitGoal}</span>
                  <span className="font-mono text-[10px] text-rpg-textDim ml-1">/ {p.totalWeeks} sem.</span>
                </td>
                <td className="px-4 py-3 font-display text-lg text-val-cream">{p.activeDays}</td>
                <td className="px-4 py-3"><EngagementStatus player={p} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Mobile: lista de cards ── */}
        <div className="md:hidden divide-y divide-val-line/10">
          {players.map((p) => (
            <div key={p.userId} className="px-4 py-3 flex items-center gap-3">
              <PlayerAvatar player={p} size={36} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display uppercase tracking-wider2 text-sm text-val-cream truncate">{firstName(p.name)}</span>
                  <EngagementStatus player={p} />
                </div>
                <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-rpg-textDim">
                  <span className="flex items-center gap-1">Semana: <WeekDots player={p} size={10} /></span>
                  <span style={{ color: "#A78BFA" }}>Meta {p.weeksHitGoal}/{p.totalWeeks}</span>
                  <span className="text-val-cream">Dias {p.activeDays}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dicas de engajamento */}
      <div className="overflow-hidden" style={{ background: "rgba(10,14,32,0.7)", border: "1px solid rgba(124,77,255,0.20)" }}>
        <button
          onClick={() => setTipsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span style={{ color: "#A78BFA" }}>
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 6v5M10 14v.5" />
              </svg>
            </span>
            <span className="font-display uppercase tracking-wider2 text-xs text-val-cream">Dicas para engajar a equipe</span>
          </div>
          <span style={{ color: "rgba(167,139,250,0.6)" }}><ChevronIcon open={tipsOpen} size={11} /></span>
        </button>

        {tipsOpen && (
          <div className="px-5 pb-4 pt-3 space-y-3" style={{ borderTop: "1px solid rgba(124,77,255,0.12)" }}>
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

function PlayerAvatar({ player, size }: { player: PlayerEngagement; size: number }) {
  return (
    <Avatar name={player.name} url={player.avatarUrl} size={size} initialsColor="#3D7FFF"
      style={{ border: "1px solid rgba(61,127,255,0.25)" }} />
  );
}

/** Uma bolinha por dia ativo da semana até a meta (+N se passou). */
function WeekDots({ player, size }: { player: PlayerEngagement; size: number }) {
  const color = player.onTrack ? COLOR_ON_TRACK : COLOR_PROGRESS;
  return (
    <span className="inline-flex items-center gap-1.5">
      {Array.from({ length: WEEKLY_GOAL_DAYS }, (_, i) => i + 1).map((n) => {
        const filled = player.currentWeekDays >= n;
        return (
          <span key={n} className="inline-block rounded-full"
            style={{
              width: size, height: size,
              background: filled ? color : "rgba(255,255,255,0.08)",
              boxShadow: filled ? `0 0 6px ${color}90` : "none",
              border: filled ? "none" : "1px solid rgba(255,255,255,0.12)",
            }} />
        );
      })}
      {player.currentWeekDays > WEEKLY_GOAL_DAYS && (
        <span className="font-mono text-[9px]" style={{ color: COLOR_ON_TRACK }}>
          +{player.currentWeekDays - WEEKLY_GOAL_DAYS}
        </span>
      )}
    </span>
  );
}

/** No ritmo / Em progresso / Sem atividade na semana. */
function EngagementStatus({ player }: { player: PlayerEngagement }) {
  const [label, color] = player.onTrack
    ? ["✦ No ritmo", COLOR_ON_TRACK]
    : player.currentWeekDays > 0
    ? ["⚡ Em progresso", COLOR_PROGRESS]
    : ["✕ Sem ativ.", COLOR_IDLE];
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5 shrink-0"
      style={{ color, background: `${color}1A`, border: `1px solid ${color}4D` }}>
      {label}
    </span>
  );
}
