import type { Challenge, SectorGoal } from "@prisma/client";
import { prisma } from "./prisma";
import { POINTS_PER_ACTIVE_DAY } from "./game-rules";
import {
  computePlayerStats,
  tierForValue,
  nextTierTarget,
  compareRank,
  type PlayerStats,
  type MedalTier,
  type NextTier
} from "./scoring";

/**
 * Desafio ativo. Criado pelo seed (`prisma/seed.ts`), que é a única fonte
 * das datas e metas iniciais.
 */
export async function getActiveChallenge(): Promise<Challenge> {
  const challenge = await prisma.challenge.findFirst({ where: { active: true } });
  if (!challenge) {
    throw new Error("Nenhum desafio ativo no banco. Rode `npm run db:seed`.");
  }
  return challenge;
}

export interface SectorGoalData extends Omit<SectorGoal, "createdAt" | "updatedAt"> {
  tier: MedalTier;
  next: NextTier | null;
}

/** Metas de escudo de cada pessoa = meta coletiva ÷ nº de participantes. */
export interface IndividualGoal {
  bronze: number;
  silver: number;
  gold: number;
}

export interface ChallengeSnapshot {
  challenge: Challenge;

  // ── Coletivo ──
  totalCollectiveActiveDays: number;  // só dias reais (meta coletiva)
  totalCollectivePoints: number;      // base (dias × pontos) + bônus de constância
  collectiveMedal: MedalTier;
  collectiveNext: NextTier | null;

  // ── Individual ──
  players: PlayerStats[];             // ordenados pelo ranking oficial (compareRank)
  individualGoal: IndividualGoal;

  // ── Metas dos setores ──
  sectorGoals: SectorGoalData[];

  daysLeft: number;
  daysTotal: number;
}

/**
 * Função central do sistema: busca tudo do banco de uma vez e devolve os
 * dados usados pelo HUB, pela página de setores e pelo painel admin.
 */
export async function buildSnapshot(): Promise<ChallengeSnapshot> {
  const challenge = await getActiveChallenge();

  const [users, rawGoals] = await Promise.all([
    prisma.user.findMany({
      include: {
        activities: {
          where: {
            status: "APPROVED",
            date: { gte: challenge.startDate, lte: challenge.endDate }
          },
          select: { date: true, durationMin: true }
        }
      }
    }),
    prisma.sectorGoal.findMany({ orderBy: { createdAt: "asc" } })
  ]);

  const players = users.map((u) => computePlayerStats(u, u.activities)).sort(compareRank);

  // ── Coletivo: SEPARAÇÃO OBRIGATÓRIA entre dias ativos e pontuação ──
  // Dias ativos coletivos = SOMENTE dias reais de atividade validada. O bônus
  // de constância NÃO vira dia ativo → usado no progresso da Meta Coletiva.
  // Pontuação coletiva = base + bônus → só exibida como pontuação da equipe.
  const totalCollectiveActiveDays = players.reduce((s, p) => s + p.activeDays, 0);
  const totalCollectiveBonus      = players.reduce((s, p) => s + p.constancyBonus, 0);
  const totalCollectivePoints     = totalCollectiveActiveDays * POINTS_PER_ACTIVE_DAY + totalCollectiveBonus;

  const { bronzeActiveDays: bronze, silverActiveDays: silver, goldActiveDays: gold } = challenge;
  const nPlayers = Math.max(1, players.length);

  const sectorGoals: SectorGoalData[] = rawGoals.map(({ createdAt, updatedAt, ...g }) => ({
    ...g,
    tier: tierForValue(g.current, g.bronze, g.silver, g.gold, g.direction),
    next: nextTierTarget(g.current, g.bronze, g.silver, g.gold, g.direction)
  }));

  const daysTotal = Math.ceil(
    (challenge.endDate.getTime() - challenge.startDate.getTime()) / 86400000
  );
  const daysLeft = Math.max(0, Math.ceil((challenge.endDate.getTime() - Date.now()) / 86400000));

  return {
    challenge,
    totalCollectiveActiveDays,
    totalCollectivePoints,
    collectiveMedal: tierForValue(totalCollectiveActiveDays, bronze, silver, gold),
    collectiveNext: nextTierTarget(totalCollectiveActiveDays, bronze, silver, gold),
    players,
    individualGoal: {
      bronze: Math.round(bronze / nPlayers),
      silver: Math.round(silver / nPlayers),
      gold:   Math.round(gold / nPlayers)
    },
    sectorGoals,
    daysLeft,
    daysTotal
  };
}
