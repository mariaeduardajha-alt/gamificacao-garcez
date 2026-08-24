import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
  compareRank,
  rankWithTies,
  computeActiveDaysStats,
  medalForTotal,
  isoWeekKey,
  WEIGHT_POINTS,
  type RankCriteria,
} from "./scoring";

describe("compareRank", () => {
  it("ordena por pontuação total primeiro", () => {
    const a: RankCriteria = { rankingPoints: 100, activeDays: 1, weeksHitGoal: 0, totalMinutes: 30 };
    const b: RankCriteria = { rankingPoints: 200, activeDays: 1, weeksHitGoal: 0, totalMinutes: 30 };
    expect(compareRank(a, b)).toBeGreaterThan(0); // b vem antes
  });

  it("usa dias ativos como 2º critério em empate de pontos", () => {
    const a: RankCriteria = { rankingPoints: 100, activeDays: 5, weeksHitGoal: 0, totalMinutes: 30 };
    const b: RankCriteria = { rankingPoints: 100, activeDays: 8, weeksHitGoal: 0, totalMinutes: 30 };
    expect(compareRank(a, b)).toBeGreaterThan(0);
  });

  it("empate total em todos os critérios dá zero", () => {
    const a: RankCriteria = { rankingPoints: 100, activeDays: 5, weeksHitGoal: 1, totalMinutes: 300 };
    const b: RankCriteria = { ...a };
    expect(compareRank(a, b)).toBe(0);
  });
});

describe("rankWithTies", () => {
  it("dá a mesma colocação só em empate total (1-2-2-2-5)", () => {
    const mk = (rankingPoints: number): RankCriteria => ({
      rankingPoints, activeDays: 0, weeksHitGoal: 0, totalMinutes: 0,
    });
    // já ordenado por compareRank, como rankWithTies espera receber
    const players = [mk(100), mk(80), mk(80), mk(80), mk(10)];
    expect(rankWithTies(players)).toEqual([1, 2, 2, 2, 5]);
  });

  it("sem empates, colocação sequencial normal", () => {
    const mk = (rankingPoints: number): RankCriteria => ({
      rankingPoints, activeDays: 0, weeksHitGoal: 0, totalMinutes: 0,
    });
    const players = [mk(100), mk(80), mk(60)];
    expect(rankWithTies(players)).toEqual([1, 2, 3]);
  });
});

describe("computeActiveDaysStats", () => {
  it("dia com <30min não conta como dia ativo", () => {
    const stats = computeActiveDaysStats([
      { date: new Date("2026-06-10T12:00:00Z"), durationMin: 20 },
    ]);
    expect(stats.activeDays).toBe(0);
    expect(stats.rankingPoints).toBe(0);
  });

  it("soma múltiplas atividades no mesmo dia pra bater os 30min", () => {
    const stats = computeActiveDaysStats([
      { date: new Date("2026-06-10T12:00:00Z"), durationMin: 15 },
      { date: new Date("2026-06-10T12:00:00Z"), durationMin: 20 },
    ]);
    expect(stats.activeDays).toBe(1);
    expect(stats.rankingPoints).toBe(10); // 1 dia ativo × 10
  });

  it("semana com ≥3 dias ativos dá bônus de constância (+20)", () => {
    const days = ["2026-06-08", "2026-06-09", "2026-06-10"]; // mesma semana ISO
    const stats = computeActiveDaysStats(
      days.map((d) => ({ date: new Date(`${d}T12:00:00Z`), durationMin: 30 }))
    );
    expect(stats.activeDays).toBe(3);
    expect(stats.weeksHitGoal).toBe(1);
    expect(stats.constancyBonus).toBe(20);
    expect(stats.rankingPoints).toBe(3 * 10 + 20);
  });
});

describe("medalForTotal", () => {
  it("respeita os limiares bronze/silver/gold", () => {
    expect(medalForTotal(0, 10, 20, 30)).toBe("NONE");
    expect(medalForTotal(10, 10, 20, 30)).toBe("BRONZE");
    expect(medalForTotal(20, 10, 20, 30)).toBe("SILVER");
    expect(medalForTotal(30, 10, 20, 30)).toBe("GOLD");
  });
});

describe("isoWeekKey", () => {
  it("mesma semana ISO para datas na mesma semana", () => {
    const seg = isoWeekKey(new Date("2026-06-08T12:00:00Z"));
    const sex = isoWeekKey(new Date("2026-06-12T12:00:00Z"));
    expect(seg).toBe(sex);
  });
});

describe("WEIGHT_POINTS em sincronia com prisma/schema.prisma", () => {
  it("bate com os valores comentados no enum DemandWeight do schema", () => {
    const schema = readFileSync(join(__dirname, "../../prisma/schema.prisma"), "utf-8");
    const enumBlock = schema.match(/enum DemandWeight \{([\s\S]*?)\}/);
    expect(enumBlock, "enum DemandWeight não encontrado no schema").toBeTruthy();

    const fromSchema: Record<string, number> = {};
    for (const line of enumBlock![1].split("\n")) {
      const m = line.match(/^\s*(\w+)\s*\/\/\s*(\d+)\s*pts/);
      if (m) fromSchema[m[1]] = Number(m[2]);
    }

    expect(Object.keys(fromSchema).length, "nenhum comentário '// N pts' achado no enum").toBeGreaterThan(0);
    expect(WEIGHT_POINTS).toEqual(fromSchema);
  });
});
