import type { Activity, Demand, DemandWeight } from "@prisma/client";

// ========== EXERCICIOS ==========
export const kcalToPoints = (kcal: number) => kcal;

/** Legado – mantido para compatibilidade com admin/histórico */
export function weeklyConstancyBonus(activeDays: number): number {
  if (activeDays >= 5) return 120;
  if (activeDays === 4) return 80;
  if (activeDays === 3) return 50;
  if (activeDays === 2) return 20;
  return 0;
}

export type MedalTier = "NONE" | "BRONZE" | "SILVER" | "GOLD";

export function medalForTotal(
  total: number,
  bronze: number,
  silver: number,
  gold: number
): MedalTier {
  if (total >= gold) return "GOLD";
  if (total >= silver) return "SILVER";
  if (total >= bronze) return "BRONZE";
  return "NONE";
}

/** Critérios oficiais de desempate, na ordem de prioridade. */
export interface RankCriteria {
  rankingPoints: number; // 1º critério: pontuação total
  activeDays: number;    // 2º critério: dias ativos validados
  weeksHitGoal: number;  // 3º critério: semanas com meta (≥3 dias) atingida
  totalMinutes: number;  // 4º critério: tempo total de atividades validadas
}

/** Compara dois participantes pelos critérios oficiais (decrescente). > 0 = b vem antes. */
export function compareRank(a: RankCriteria, b: RankCriteria): number {
  return (
    b.rankingPoints - a.rankingPoints ||
    b.activeDays    - a.activeDays    ||
    b.weeksHitGoal  - a.weeksHitGoal  ||
    b.totalMinutes  - a.totalMinutes
  );
}

/**
 * Colocação com desempate oficial (standard competition ranking).
 *
 * Ordem dos critérios: pontuação total → dias ativos → semanas com meta →
 * tempo total de atividades. Dois participantes só ficam na MESMA colocação
 * se forem iguais em TODOS esses critérios. Quando qualquer critério difere,
 * a colocação avança (estilo 1-2-3-4-5).
 *
 * NÃO usa nome, ID, ordem alfabética ou ordem de cadastro como desempate.
 * Recebe a lista JÁ ordenada por compareRank e devolve as colocações por índice.
 */
export function rankWithTies(players: RankCriteria[]): number[] {
  const ranks: number[] = [];
  let currentRank = 1;
  let previous: RankCriteria | null = null;

  players.forEach((p, idx) => {
    // Só mantém a colocação se for empate TOTAL em todos os critérios
    if (previous === null || compareRank(previous, p) !== 0) {
      currentRank = idx + 1;
    }
    previous = p;
    ranks.push(currentRank);
  });

  return ranks;
}

// ========== DEMANDAS (ClickUp) ==========
export const WEIGHT_POINTS: Record<DemandWeight, number> = {
  SMALL: 5,
  MEDIUM: 15,
  LARGE: 30,
  EPIC: 50
};

export const WEIGHT_LABEL: Record<DemandWeight, string> = {
  SMALL: "Rápida",
  MEDIUM: "Padrão",
  LARGE: "Pesada",
  EPIC: "Épica"
};

export const WEIGHT_COLOR: Record<DemandWeight, string> = {
  SMALL: "#53E2D1",
  MEDIUM: "#FFD86B",
  LARGE: "#FF8B47",
  EPIC: "#FF4655"
};

// ========== UTIL ==========
export function isoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// ========== NOVA LÓGICA: DIAS ATIVOS ==========
/**
 * Regra Movimento em Jogo:
 * - Dia ativo = pelo menos 30 min totais de atividade aprovada no dia
 * - 1 dia ativo = 10 pontos base
 * - Bônus de sequência: +20 pts para cada par de semanas CONSECUTIVAS
 *   em que a pessoa bateu a meta oficial de ≥3 dias ativos (pares não-sobrepostos)
 */
export interface ActiveDaysStats {
  activeDays: number;
  weeksHitGoal: number; // semanas com ≥3 dias ativos
  constancyBonus: number; // pares consecutivos × 20
  rankingPoints: number; // activeDays × 10 + constancyBonus
}

export function computeActiveDaysStats(
  activities: Pick<Activity, "date" | "durationMin">[]
): ActiveDaysStats {
  // 1. Agrupa por dia e soma duração
  const dayDuration = new Map<string, number>();
  for (const a of activities) {
    const dk = a.date.toISOString().slice(0, 10); // seguro pois datas são salvas ao meio-dia UTC
    dayDuration.set(dk, (dayDuration.get(dk) || 0) + (a.durationMin || 0));
  }

  // 2. Dias ativos: ≥30 min no dia
  const activeDayKeys = [...dayDuration.entries()]
    .filter(([, dur]) => dur >= 30)
    .map(([dk]) => dk);
  const activeDays = activeDayKeys.length;

  // 3. Agrupa dias ativos por semana ISO
  const weekActiveDays = new Map<string, number>();
  for (const dk of activeDayKeys) {
    const wk = isoWeekKey(new Date(dk + "T12:00:00Z"));
    weekActiveDays.set(wk, (weekActiveDays.get(wk) || 0) + 1);
  }

  // 4. Semanas que bateram a meta oficial (≥3 dias ativos)
  const qualifyingWeeks = [...weekActiveDays.entries()]
    .filter(([, cnt]) => cnt >= 3)
    .map(([wk]) => wk)
    .sort();
  const weeksHitGoal = qualifyingWeeks.length;

  // 5. +20 pts por cada semana que bateu a meta (≥3 dias ativos)
  const constancyBonus = weeksHitGoal * 20;
  const rankingPoints = activeDays * 10 + constancyBonus;

  return { activeDays, weeksHitGoal, constancyBonus, rankingPoints };
}

// ========== PLAYER STATS ==========
export interface PlayerStats {
  userId: string;
  name: string;
  sector: string | null;
  avatarUrl: string | null;

  // Fitness (legado – registrar/admin)
  totalKcal: number;
  activitiesCount: number;

  // Movimento em Jogo – dias ativos
  activeDays: number;
  weeksHitGoal: number;
  constancyBonus: number;
  rankingPoints: number; // activeDays × 10 + constancyBonus
  totalMinutes: number;  // tempo total de atividades validadas (desempate)

  // Legado (mantido para não quebrar admin)
  fitnessPoints: number;
  demandsPoints: number;
  demandsCount: number;
  epicCount: number;
  totalPoints: number;
}

export function computePlayerStats(
  user: { id: string; name: string; sector: string | null; avatarUrl: string | null },
  activities: Pick<Activity, "date" | "kcal" | "durationMin">[],
  demands: Pick<Demand, "points" | "weight">[]
): PlayerStats {
  const totalKcal = activities.reduce((s, a) => s + a.kcal, 0);
  const totalMinutes = activities.reduce((s, a) => s + (a.durationMin || 0), 0);

  // Nova lógica: dias ativos via duração
  const adStats = computeActiveDaysStats(activities);

  // Legado
  const dayKeys = new Set(activities.map((a) => a.date.toISOString().slice(0, 10)));

  // Bonus legado por semana (mantido para compatibilidade)
  const perWeek = new Map<string, Set<string>>();
  for (const a of activities) {
    const wk = isoWeekKey(a.date);
    if (!perWeek.has(wk)) perWeek.set(wk, new Set());
    perWeek.get(wk)!.add(a.date.toISOString().slice(0, 10));
  }
  let legacyBonus = 0;
  for (const days of perWeek.values()) legacyBonus += weeklyConstancyBonus(days.size);

  const fitnessPoints = kcalToPoints(totalKcal) + legacyBonus;
  const demandsPoints = demands.reduce((s, d) => s + d.points, 0);
  const epicCount = demands.filter((d) => d.weight === "EPIC").length;

  return {
    userId: user.id,
    name: user.name,
    sector: user.sector,
    avatarUrl: user.avatarUrl,
    totalKcal,
    activitiesCount: activities.length,
    // Novo
    activeDays: adStats.activeDays,
    weeksHitGoal: adStats.weeksHitGoal,
    constancyBonus: adStats.constancyBonus,
    rankingPoints: adStats.rankingPoints,
    totalMinutes,
    // Legado
    fitnessPoints,
    demandsPoints,
    demandsCount: demands.length,
    epicCount,
    totalPoints: fitnessPoints + demandsPoints
  };
}
