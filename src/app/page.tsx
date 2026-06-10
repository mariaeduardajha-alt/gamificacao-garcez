import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildSnapshot } from "@/lib/challenge";
import { Navbar } from "@/components/Navbar";
import { MedalGauge } from "@/components/MedalGauge";
import { PodiumShield } from "@/components/PodiumShield";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Shield } from "@/components/Shield";
import { medalForTotal, rankWithTies, type PlayerStats, type MedalTier } from "@/lib/scoring";
import { BonusSound } from "@/components/BonusSound";
import { ScoreAnimation } from "@/components/ScoreAnimation";
import { MedalAchievement } from "@/components/MedalAchievement";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const s = await buildSnapshot();
  const rank = s.rankActiveDays;
  const maxPts = Math.max(1, rank[0]?.rankingPoints ?? 1);
  const isAdmin = session.user.role === "ADMIN";

  // Colocação com empates reais (mesma pontuação = mesma posição)
  const ranks = rankWithTies(rank);

  // Stats do jogador atual
  const myStats = s.players.find((p) => p.userId === session.user.id);
  const myIdx = rank.findIndex((p) => p.userId === session.user.id);
  const myPosition = myIdx >= 0 ? ranks[myIdx] : 0;

  // Thresholds individuais = coletivo ÷ nº de jogadores
  const nPlayers = Math.max(1, s.players.length);
  const indBronze = Math.round(s.challenge.bronzeActiveDays / nPlayers);
  const indSilver = Math.round(s.challenge.silverActiveDays / nPlayers);
  const indGold   = Math.round(s.challenge.goldActiveDays   / nPlayers);

  return (
    <>
      <Navbar />
      {myStats && (
        <BonusSound weeksHitGoal={myStats.weeksHitGoal} userId={session.user.id} />
      )}
      <ScoreAnimation currentPoints={myStats?.rankingPoints ?? 0} />
      {myStats && (
        <MedalAchievement
          tier={medalForTotal(myStats.activeDays, indBronze, indSilver, indGold)}
          userId={session.user.id}
        />
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-14">

        {/* ════════════════════════════════════════════════════════
            HEADER — Movimento em Jogo
        ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden val-card">
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(124,77,255,0.8), rgba(61,127,255,0.8), transparent)"
            }}
          />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider2"
                style={{ color: "#7C4DFF" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-blue"
                  style={{ background: "#3D7FFF" }} />
                Operação ativa · {s.daysLeft} dias restantes de {s.daysTotal}
              </div>
              <h1
                className="val-heading mt-1"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  background: "linear-gradient(135deg, #D4DCF0 30%, #A78BFA 70%, #3D7FFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Movimento em Jogo
              </h1>
              <p className="font-mono text-rpg-textDim text-xs uppercase tracking-wider2 mt-1">
                08.JUN.2026 — 08.JUL.2026 · Equipe Garcez · {s.players.length} agentes
              </p>
            </div>

            {/* Painel de missão — igual para todos */}
            {true && (
              <div className="grid grid-cols-2 gap-3">
                <MissionStat
                  icon={
                    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="10,2 12.5,7.5 18,8.2 14,12 15.2,18 10,15 4.8,18 6,12 2,8.2 7.5,7.5" />
                    </svg>
                  }
                  label="Sua posição"
                  value={myPosition > 0 ? `${myPosition}°` : "—"}
                  color="#F0C040"
                />
                <MissionStat
                  icon={
                    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 2v6l4 2" /><circle cx="10" cy="10" r="8" />
                    </svg>
                  }
                  label="Dias ativos"
                  value={String(myStats?.activeDays ?? 0)}
                  color="#2DD4BF"
                />
                <MissionStat
                  icon={
                    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4l4 4-2 6 4-3 4 3-2-6 4-4-6-.5z" />
                    </svg>
                  }
                  label="Seus pontos"
                  value={String(myStats?.rankingPoints ?? 0)}
                  color="#A78BFA"
                />
                <MissionStat
                  icon={
                    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="14" height="13" rx="2" />
                      <path d="M3 8h14M7 2v4M13 2v4" />
                    </svg>
                  }
                  label="Dias restantes"
                  value={String(s.daysLeft)}
                  color="#3D7FFF"
                />
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            BLOCO 1 — META COLETIVA
        ════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            icon="⚔"
            title="Meta Coletiva"
            subtitle="Trilha coletiva · Dias ativos + bônus de constância"
            color="#7C4DFF"
          />
          <MedalGauge
            title="Escudo da Equipe"
            subtitle="Movimento em Jogo // Dias ativos + bônus · Jun–Jul 2026"
            value={s.totalCollectiveActiveDays}
            unit="dias ativos"
            bronze={s.challenge.bronzeActiveDays}
            silver={s.challenge.silverActiveDays}
            gold={s.challenge.goldActiveDays}
            tier={s.collectiveMedal}
            next={s.collectiveNext}
            totalPoints={s.totalCollectiveActiveDays * 10}
            socialAction={s.collectiveMedal !== "NONE"}
          />
        </section>

        {/* ════════════════════════════════════════════════════════
            BLOCO 2 — RANKING GERAL (Pódio)
        ════════════════════════════════════════════════════════ */}
        <section id="ranking-geral">
          <SectionHeader
            icon="🏆"
            title="Ranking Geral"
            subtitle="Dias ativos (≥30 min) + bônus de sequência · Período completo"
            color="#F0C040"
          />

          {/* Pódio centralizado */}
          <div className="flex flex-col items-center">
            <div className="flex items-end justify-center gap-4 pb-2">
              {/* 2° lugar */}
              <PodiumShield player={rank[1]} position={2} rankLabel={ranks[1]} maxPoints={maxPts} bronze={indBronze} silver={indSilver} gold={indGold} />

              {/* 1° lugar — centralizado e mais alto */}
              <div style={{ marginBottom: 20 }}>
                <PodiumShield player={rank[0]} position={1} rankLabel={ranks[0]} maxPoints={maxPts} bronze={indBronze} silver={indSilver} gold={indGold} />
              </div>

              {/* 3° lugar */}
              <PodiumShield player={rank[2]} position={3} rankLabel={ranks[2]} maxPoints={maxPts} bronze={indBronze} silver={indSilver} gold={indGold} />
            </div>

            {/* Esferas 3D no chão — estética de jogo */}
            <div className="flex items-end justify-center gap-3 mt-1" style={{ height: 32 }}>
              {[
                { s: 10, y: 6,  op: 0.30 },
                { s: 13, y: 3,  op: 0.45 },
                { s: 18, y: 0,  op: 0.65 },
                { s: 22, y: 0,  op: 0.80 },
                { s: 26, y: 0,  op: 1.00 },
                { s: 22, y: 0,  op: 0.80 },
                { s: 18, y: 0,  op: 0.65 },
                { s: 13, y: 3,  op: 0.45 },
                { s: 10, y: 6,  op: 0.30 },
              ].map(({ s, y, op }, i) => (
                <div
                  key={i}
                  style={{
                    width: s, height: s,
                    borderRadius: "50%",
                    marginBottom: y,
                    opacity: op,
                    flexShrink: 0,
                    background: `radial-gradient(circle at 35% 32%, #1e2a4a, #06091a 70%)`,
                    boxShadow: `0 ${s * 0.18}px ${s * 0.4}px rgba(0,0,0,0.85), inset 0 ${s * 0.12}px ${s * 0.2}px rgba(80,120,220,0.18)`,
                    border: "1px solid rgba(40,60,120,0.5)",
                  }}
                />
              ))}
            </div>

            {/* Legenda do pódio */}
            <div className="mt-3 rpg-divider w-full max-w-md mx-auto" />
            <div className="flex flex-wrap justify-center gap-4 mt-3 font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim">
              <span style={{ color: "rgba(240,192,48,0.7)" }}>◆ 1 dia ativo = 10 pts</span>
              <span style={{ color: "rgba(61,127,255,0.7)" }}>◆ meta semanal = 3 dias</span>
              <span style={{ color: "rgba(124,77,255,0.7)" }}>◆ semana com ≥3 dias = +20 bônus</span>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            BLOCO 3 — LISTA COMPLETA DO RANKING
        ════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            icon="📋"
            title="Classificação Completa"
            subtitle="Todos os agentes · Pontuação acumulada"
            color="#3D7FFF"
          />

          <div className="space-y-3">
            {rank.map((player, idx) => (
              <RankRow
                key={player.userId}
                player={player}
                position={ranks[idx]}
                maxPoints={maxPts}
                bronze={indBronze}
                silver={indSilver}
                gold={indGold}
              />
            ))}
          </div>
        </section>

      </main>
    </>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function SectionHeader({
  icon, title, subtitle, color
}: { icon: string; title: string; subtitle: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-8 rounded-full" style={{ background: color }} />
      <div>
        <h2 className="val-heading text-2xl md:text-3xl">
          <span className="mr-2 text-xl">{icon}</span>{title}
        </h2>
        <p className="font-mono text-rpg-textDim text-xs uppercase tracking-wider2 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function MissionStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
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

function MiniStat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div
      className="px-3 py-2"
      style={{
        background: warn ? "rgba(255,70,85,0.08)" : "rgba(13,19,48,0.6)",
        border: `1px solid ${warn ? "rgba(255,70,85,0.4)" : "rgba(61,127,255,0.2)"}`,
      }}
    >
      <div className="font-display text-xl" style={{ color: warn ? "#FF4655" : "#D4DCF0" }}>
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim">
        {label}
      </div>
    </div>
  );
}

const POSITION_COLORS: Record<number, { bar: string; badge: string; badgeBg: string; badgeBorder: string }> = {
  1: { bar: "rgba(240,192,48,0.8)",   badge: "#F0C040", badgeBg: "rgba(240,192,48,0.12)",  badgeBorder: "rgba(240,192,48,0.4)"  },
  2: { bar: "rgba(143,168,200,0.8)",  badge: "#8FA8C8", badgeBg: "rgba(143,168,200,0.10)", badgeBorder: "rgba(143,168,200,0.35)" },
  3: { bar: "rgba(192,112,48,0.8)",   badge: "#C07030", badgeBg: "rgba(192,112,48,0.10)",  badgeBorder: "rgba(192,112,48,0.35)" },
};

function RankRow({
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
      className="relative overflow-hidden flex items-center gap-4 px-4 py-4 transition-all"
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
        className="font-display text-lg w-10 text-center shrink-0"
        style={{
          color: colors.badge,
          textShadow: isTop3 ? `0 0 10px ${colors.badge}80` : "none",
        }}
      >
        {position}°
      </div>

      {/* Escudo (Medal tier) */}
      <div className="shrink-0">
        <Shield tier={medal} size={32} />
      </div>

      {/* Avatar */}
      <PlayerAvatar name={player.name} url={player.avatarUrl} size={46} rank={position} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className="font-display uppercase tracking-wider2 leading-tight truncate"
          style={{ fontSize: 13, color: isTop3 ? colors.badge : "#D4DCF0" }}
        >
          {player.name}
        </div>
        <div className="font-mono text-[10px] text-rpg-textDim mt-0.5 truncate">
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
      <div className="text-right shrink-0 pl-2">
        <div
          className="font-display text-2xl leading-none"
          style={{
            color: colors.badge,
            textShadow: isTop3 ? `0 0 12px ${colors.badge}60` : "none",
          }}
        >
          {player.rankingPoints}
        </div>
        <div className="font-mono text-[9px] text-rpg-textDim mt-0.5 uppercase tracking-wider2">
          pontos
        </div>
      </div>
    </div>
  );
}
