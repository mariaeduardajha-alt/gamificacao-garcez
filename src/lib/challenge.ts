import { prisma } from "./prisma";
import {
  computePlayerStats,
  computeActiveDaysStats,
  medalForTotal,
  compareRank,
  type PlayerStats,
  type MedalTier
} from "./scoring";

export async function getActiveChallenge() {
  let challenge = await prisma.challenge.findFirst({ where: { active: true } });
  if (!challenge) {
    challenge = await prisma.challenge.create({
      data: {
        name: "Movimento em Jogo",
        startDate: new Date("2026-06-08T00:00:00Z"),
        endDate: new Date("2026-07-08T23:59:59Z"),
        bronzeActiveDays: 48,
        silverActiveDays: 72,
        goldActiveDays: 96,
        active: true
      }
    });
  }
  return challenge;
}

export interface SectorGoalData {
  id: string;
  area: string;
  responsible: string;
  indicator: string;
  current: number;
  bronze: number;
  silver: number;
  gold: number;
  unit: string;
  direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  avatarUrl: string | null;
  tier: MedalTier;
  nextTarget: number | null;
  nextLabel: string | null;
  gap: number | null; // quanto falta (sempre positivo)
}

function computeSectorTier(
  current: number,
  bronze: number,
  silver: number,
  gold: number,
  direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER"
): MedalTier {
  if (direction === "HIGHER_IS_BETTER") {
    return medalForTotal(current, bronze, silver, gold);
  } else {
    // Menor = melhor: gold ≤ current ≤ bronze
    if (current <= gold) return "GOLD";
    if (current <= silver) return "SILVER";
    if (current <= bronze) return "BRONZE";
    return "NONE";
  }
}

function computeSectorNext(
  current: number,
  bronze: number,
  silver: number,
  gold: number,
  direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER"
): { nextTarget: number; nextLabel: string; gap: number } | null {
  if (direction === "HIGHER_IS_BETTER") {
    if (current < bronze) return { nextTarget: bronze, nextLabel: "BRONZE", gap: bronze - current };
    if (current < silver) return { nextTarget: silver, nextLabel: "PRATA",  gap: silver - current };
    if (current < gold)   return { nextTarget: gold,   nextLabel: "OURO",   gap: gold - current };
    return null;
  } else {
    if (current > bronze) return { nextTarget: bronze, nextLabel: "BRONZE", gap: current - bronze };
    if (current > silver) return { nextTarget: silver, nextLabel: "PRATA",  gap: current - silver };
    if (current > gold)   return { nextTarget: gold,   nextLabel: "OURO",   gap: current - gold };
    return null;
  }
}

export interface ChallengeSnapshot {
  challenge: Awaited<ReturnType<typeof getActiveChallenge>>;

  // ── MOVIMENTO EM JOGO: coletivo (junho) ──
  totalCollectiveActiveDays: number;
  collectiveMedal: MedalTier;
  collectiveNext: { target: number; label: string } | null;
  collectiveProgressPct: number;

  // ── RANKING INDIVIDUAL (período completo) ──
  rankActiveDays: PlayerStats[];

  // ── METAS DOS SETORES ──
  sectorGoals: SectorGoalData[];

  // ── Legado (admin / registrar) ──
  players: PlayerStats[];
  rankFitness: PlayerStats[];
  rankConstancy: PlayerStats[];
  rankDemands: PlayerStats[];
  rankOverall: PlayerStats[];
  totalKcal: number;
  fitnessMedal: MedalTier;
  fitnessNext: { target: number; label: string } | null;
  totalDemandPoints: number;
  demandsMedal: MedalTier;
  demandsNext: { target: number; label: string } | null;
  approvedActivities: number;
  pendingActivities: number;
  approvedDemands: number;
  pendingDemands: number;
  daysLeft: number;
  daysTotal: number;
}

export async function buildSnapshot(): Promise<ChallengeSnapshot> {
  const challenge = await getActiveChallenge();

  // ── Busca usuários com atividades (período completo do desafio) ──
  const users = await prisma.user.findMany({
    include: {
      activities: {
        where: {
          status: "APPROVED",
          date: { gte: challenge.startDate, lte: challenge.endDate }
        },
        select: { date: true, kcal: true, durationMin: true }
      },
      demands: {
        where: {
          status: "APPROVED",
          completedAt: { gte: challenge.startDate, lte: challenge.endDate }
        },
        select: { points: true, weight: true }
      }
    }
  });

  const players = users.map((u) =>
    computePlayerStats(u, u.activities, u.demands)
  );

  // ── Ranking individual: pontuação → dias ativos → semanas com meta → tempo total ──
  const rankActiveDays = [...players].sort(compareRank);

  // ── Coletivo: dias ativos + bônus individuais convertidos em dias equivalentes
  //    rankingPoints = activeDays×10 + constancyBonus  →  ÷10 = dias equivalentes
  //    Assim o esforço de constância individual recompensa o desbloqueio coletivo.
  let totalCollectiveActiveDays = 0;
  for (const p of players) {
    totalCollectiveActiveDays += p.rankingPoints / 10;
  }
  totalCollectiveActiveDays = Math.round(totalCollectiveActiveDays);

  const collectiveMedal = medalForTotal(
    totalCollectiveActiveDays,
    challenge.bronzeActiveDays,
    challenge.silverActiveDays,
    challenge.goldActiveDays
  );
  const collectiveProgressPct = Math.min(
    100,
    (totalCollectiveActiveDays / challenge.goldActiveDays) * 100
  );
  const collectiveNext =
    totalCollectiveActiveDays < challenge.bronzeActiveDays
      ? { target: challenge.bronzeActiveDays, label: "BRONZE" }
      : totalCollectiveActiveDays < challenge.silverActiveDays
      ? { target: challenge.silverActiveDays, label: "PRATA" }
      : totalCollectiveActiveDays < challenge.goldActiveDays
      ? { target: challenge.goldActiveDays, label: "OURO" }
      : null;

  // ── Metas dos Setores ──
  const rawGoals = await prisma.sectorGoal.findMany({ orderBy: { createdAt: "asc" } });
  const sectorGoals: SectorGoalData[] = rawGoals.map((g) => {
    const tier = computeSectorTier(g.current, g.bronze, g.silver, g.gold, g.direction);
    const next = computeSectorNext(g.current, g.bronze, g.silver, g.gold, g.direction);
    return {
      id: g.id,
      area: g.area,
      responsible: g.responsible,
      indicator: g.indicator,
      current: g.current,
      bronze: g.bronze,
      silver: g.silver,
      gold: g.gold,
      unit: g.unit,
      direction: g.direction,
      avatarUrl: g.avatarUrl,
      tier,
      nextTarget: next?.nextTarget ?? null,
      nextLabel: next?.nextLabel ?? null,
      gap: next?.gap ?? null
    };
  });

  // ── Legado ──
  const totalKcal = players.reduce((s, p) => s + p.totalKcal, 0);
  const fitnessMedal = medalForTotal(totalKcal, challenge.bronzeKcal, challenge.silverKcal, challenge.goldKcal);
  const fitnessNext =
    totalKcal < challenge.bronzeKcal ? { target: challenge.bronzeKcal, label: "BRONZE" } :
    totalKcal < challenge.silverKcal ? { target: challenge.silverKcal, label: "PRATA" } :
    totalKcal < challenge.goldKcal   ? { target: challenge.goldKcal,   label: "OURO" } : null;

  const totalDemandPoints = players.reduce((s, p) => s + p.demandsPoints, 0);
  const demandsMedal = medalForTotal(totalDemandPoints, challenge.bronzePoints, challenge.silverPoints, challenge.goldPoints);
  const demandsNext =
    totalDemandPoints < challenge.bronzePoints ? { target: challenge.bronzePoints, label: "BRONZE" } :
    totalDemandPoints < challenge.silverPoints ? { target: challenge.silverPoints, label: "PRATA" } :
    totalDemandPoints < challenge.goldPoints   ? { target: challenge.goldPoints,   label: "OURO" } : null;

  const rankFitness   = [...players].sort((a, b) => b.fitnessPoints - a.fitnessPoints);
  const rankConstancy = [...players].sort((a, b) => b.activeDays - a.activeDays || b.constancyBonus - a.constancyBonus);
  const rankDemands   = [...players].sort((a, b) => b.demandsPoints - a.demandsPoints);
  const rankOverall   = [...players].sort((a, b) => b.totalPoints - a.totalPoints);

  const [approvedActivities, pendingActivities, approvedDemands, pendingDemands] =
    await Promise.all([
      prisma.activity.count({ where: { status: "APPROVED", date: { gte: challenge.startDate, lte: challenge.endDate } } }),
      prisma.activity.count({ where: { status: "PENDING" } }),
      prisma.demand.count({ where: { status: "APPROVED", completedAt: { gte: challenge.startDate, lte: challenge.endDate } } }),
      prisma.demand.count({ where: { status: "PENDING" } })
    ]);

  const daysTotal = Math.ceil(
    (challenge.endDate.getTime() - challenge.startDate.getTime()) / 86400000
  );
  const daysLeft = Math.max(0, Math.ceil((challenge.endDate.getTime() - Date.now()) / 86400000));

  return {
    challenge,
    totalCollectiveActiveDays,
    collectiveMedal,
    collectiveNext,
    collectiveProgressPct,
    rankActiveDays,
    sectorGoals,
    players,
    rankFitness,
    rankConstancy,
    rankDemands,
    rankOverall,
    totalKcal,
    fitnessMedal,
    fitnessNext,
    totalDemandPoints,
    demandsMedal,
    demandsNext,
    approvedActivities,
    pendingActivities,
    approvedDemands,
    pendingDemands,
    daysLeft,
    daysTotal
  };
}
