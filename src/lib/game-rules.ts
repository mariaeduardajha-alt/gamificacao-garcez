import type { ActivityType, DemandWeight } from "@prisma/client";

/**
 * Regras do jogo — fonte única. Qualquer número ou rótulo de regra exibido
 * na tela ou usado em cálculo deve vir daqui.
 */

// ========== EXERCÍCIOS / DIAS ATIVOS ==========
/** Minutos somados no mesmo dia para ele contar como dia ativo. */
export const MIN_MINUTES_PER_ACTIVE_DAY = 30;
/** Pontos por dia ativo. */
export const POINTS_PER_ACTIVE_DAY = 10;
/** Dias ativos na mesma semana (ISO, seg–dom) para bater a meta semanal. */
export const WEEKLY_GOAL_DAYS = 3;
/** Bônus de constância por semana que bateu a meta. */
export const CONSTANCY_BONUS_POINTS = 20;

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  CAMINHADA:   "Caminhada",
  CORRIDA:     "Corrida",
  CICLISMO:    "Ciclismo",
  MUSCULACAO:  "Musculação",
  FUNCIONAL:   "Funcional",
  DANCA:       "Dança",
  NATACAO:     "Natação",
  ESPORTE:     "Esporte",
  TREINO_CASA: "Treino em casa",
  TRILHA:      "Trilha",
  OUTRA:       "Outra",
};

// ========== DEMANDAS (registro manual; peso → pontos) ==========
export const DEMAND_WEIGHTS: DemandWeight[] = ["SMALL", "MEDIUM", "LARGE", "EPIC"];

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
