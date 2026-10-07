import type { Activity, GoalDirection } from "@prisma/client";
import {
  MIN_MINUTES_PER_ACTIVE_DAY,
  POINTS_PER_ACTIVE_DAY,
  WEEKLY_GOAL_DAYS,
  CONSTANCY_BONUS_POINTS,
} from "./game-rules";

export type MedalTier = "NONE" | "BRONZE" | "SILVER" | "GOLD";

// ========== ESCUDOS (bronze / prata / ouro) ==========
/**
 * Determina o escudo atual dado um valor e os 3 limiares, parametrizado por
 * direção. Metas de setor podem ser LOWER_IS_BETTER (ex.: "reduzir tempo de
 * resposta"); o resto do jogo é sempre HIGHER_IS_BETTER.
 */
export function tierForValue(
  current: number,
  bronze: number,
  silver: number,
  gold: number,
  direction: GoalDirection = "HIGHER_IS_BETTER"
): MedalTier {
  if (direction === "HIGHER_IS_BETTER") {
    if (current >= gold) return "GOLD";
    if (current >= silver) return "SILVER";
    if (current >= bronze) return "BRONZE";
    return "NONE";
  }
  // Menor = melhor: gold ≤ current ≤ bronze
  if (current <= gold) return "GOLD";
  if (current <= silver) return "SILVER";
  if (current <= bronze) return "BRONZE";
  return "NONE";
}

export interface NextTier {
  tier: Exclude<MedalTier, "NONE">;
  target: number;
  gap: number; // quanto falta (sempre positivo)
}

/** Próximo escudo a conquistar e quanto falta, na mesma direção de tierForValue. */
export function nextTierTarget(
  current: number,
  bronze: number,
  silver: number,
  gold: number,
  direction: GoalDirection = "HIGHER_IS_BETTER"
): NextTier | null {
  if (direction === "HIGHER_IS_BETTER") {
    if (current < bronze) return { tier: "BRONZE", target: bronze, gap: bronze - current };
    if (current < silver) return { tier: "SILVER", target: silver, gap: silver - current };
    if (current < gold) return { tier: "GOLD", target: gold, gap: gold - current };
    return null;
  }
  if (current > bronze) return { tier: "BRONZE", target: bronze, gap: current - bronze };
  if (current > silver) return { tier: "SILVER", target: silver, gap: current - silver };
  if (current > gold) return { tier: "GOLD", target: gold, gap: current - gold };
  return null;
}

// ========== RANKING ==========
/** Critérios oficiais de desempate, na ordem de prioridade. */
export interface RankCriteria {
  rankingPoints: number; // 1º critério: pontuação total
  activeDays: number;    // 2º critério: dias ativos validados
  weeksHitGoal: number;  // 3º critério: semanas com meta atingida
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

// ========== DIAS ATIVOS ==========
/** Chave da semana ISO (seg–dom) de uma data, ex.: "2026-W24". */
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

type ActivityTime = Pick<Activity, "date" | "durationMin">;

/**
 * Dias ativos ("AAAA-MM-DD"): dias cuja SOMA de minutos de atividade aprovada
 * atinge o mínimo. Fonte única — qualquer tela que mostre dias ativos usa esta função.
 */
export function activeDayKeys(activities: ActivityTime[]): string[] {
  const dayDuration = new Map<string, number>();
  for (const a of activities) {
    const dk = a.date.toISOString().slice(0, 10); // seguro pois datas são salvas ao meio-dia UTC
    dayDuration.set(dk, (dayDuration.get(dk) || 0) + (a.durationMin || 0));
  }
  return [...dayDuration.entries()]
    .filter(([, dur]) => dur >= MIN_MINUTES_PER_ACTIVE_DAY)
    .map(([dk]) => dk);
}

/** Quantos dias ativos caem na semana ISO informada. */
export function activeDaysInWeek(dayKeys: string[], weekKey: string): number {
  return dayKeys.filter((dk) => isoWeekKey(new Date(dk + "T12:00:00Z")) === weekKey).length;
}

export interface ActiveDaysStats {
  activeDays: number;
  activeDayKeys: string[];
  weeksHitGoal: number;   // semanas com ≥ WEEKLY_GOAL_DAYS dias ativos
  constancyBonus: number; // weeksHitGoal × CONSTANCY_BONUS_POINTS
  rankingPoints: number;  // activeDays × POINTS_PER_ACTIVE_DAY + constancyBonus
}

export function computeActiveDaysStats(activities: ActivityTime[]): ActiveDaysStats {
  const keys = activeDayKeys(activities);

  const weekActiveDays = new Map<string, number>();
  for (const dk of keys) {
    const wk = isoWeekKey(new Date(dk + "T12:00:00Z"));
    weekActiveDays.set(wk, (weekActiveDays.get(wk) || 0) + 1);
  }
  const weeksHitGoal = [...weekActiveDays.values()].filter((cnt) => cnt >= WEEKLY_GOAL_DAYS).length;

  const constancyBonus = weeksHitGoal * CONSTANCY_BONUS_POINTS;
  const rankingPoints = keys.length * POINTS_PER_ACTIVE_DAY + constancyBonus;

  return { activeDays: keys.length, activeDayKeys: keys, weeksHitGoal, constancyBonus, rankingPoints };
}

// ========== PLAYER STATS ==========
export interface PlayerStats extends ActiveDaysStats {
  userId: string;
  name: string;
  sector: string | null;
  avatarUrl: string | null;
  totalMinutes: number; // tempo total de atividades validadas (desempate)
}

export function computePlayerStats(
  user: { id: string; name: string; sector: string | null; avatarUrl: string | null },
  activities: ActivityTime[]
): PlayerStats {
  return {
    userId: user.id,
    name: user.name,
    sector: user.sector,
    avatarUrl: user.avatarUrl,
    ...computeActiveDaysStats(activities),
    totalMinutes: activities.reduce((s, a) => s + (a.durationMin || 0), 0),
  };
}
