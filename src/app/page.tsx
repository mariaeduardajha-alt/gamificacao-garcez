import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildSnapshot } from "@/lib/challenge";
import { Navbar } from "@/components/Navbar";
import { MedalGauge } from "@/components/MedalGauge";
import { PodiumShield } from "@/components/PodiumShield";
import { SectionHeader } from "@/components/SectionHeader";
import { MissionStat } from "@/components/MissionStat";
import { RankRow } from "@/components/RankRow";
import { medalForTotal, rankWithTies } from "@/lib/scoring";
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 space-y-10 sm:space-y-14">

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
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-wider2"
                style={{ color: "#7C4DFF" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-blue shrink-0"
                  style={{ background: "#3D7FFF" }} />
                Operação ativa · {s.daysLeft} dias restantes de {s.daysTotal}
              </div>
              <h1
                className="val-heading mt-1"
                style={{
                  fontSize: "clamp(1.7rem, 6vw, 3.5rem)",
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
            totalPoints={s.totalCollectivePoints}
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
            {/* ── Desktop: pódio horizontal 2-1-3 ── */}
            <div className="hidden md:flex items-end justify-center gap-4 pb-2">
              {/* 2° lugar */}
              <PodiumShield player={rank[1]} position={2} maxPoints={maxPts} bronze={indBronze} silver={indSilver} gold={indGold} />

              {/* 1° lugar — centralizado e mais alto */}
              <div style={{ marginBottom: 20 }}>
                <PodiumShield player={rank[0]} position={1} maxPoints={maxPts} bronze={indBronze} silver={indSilver} gold={indGold} />
              </div>

              {/* 3° lugar */}
              <PodiumShield player={rank[2]} position={3} maxPoints={maxPts} bronze={indBronze} silver={indSilver} gold={indGold} />
            </div>

            {/* ── Mobile: pódio vertical 1-2-3 empilhado ── */}
            <div className="flex md:hidden flex-col items-center gap-1 pb-2 w-full">
              <PodiumShield player={rank[0]} position={1} maxPoints={maxPts} bronze={indBronze} silver={indSilver} gold={indGold} />
              <PodiumShield player={rank[1]} position={2} maxPoints={maxPts} bronze={indBronze} silver={indSilver} gold={indGold} />
              <PodiumShield player={rank[2]} position={3} maxPoints={maxPts} bronze={indBronze} silver={indSilver} gold={indGold} />
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
