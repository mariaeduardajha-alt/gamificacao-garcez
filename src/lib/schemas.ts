import { z } from "zod";
import { ActivityType, DemandWeight } from "@prisma/client";

/**
 * Validação do formulário (multipart) de criação de atividade.
 * `date` é validado como string não-vazia aqui — a rota reconstrói a Date
 * real a partir da string crua (meio-dia UTC) para não deslocar o dia por
 * fuso horário; não usamos `z.coerce.date()` para não perder essa string.
 */
export const createActivitySchema = z.object({
  date: z.string().min(1),
  type: z.nativeEnum(ActivityType),
  durationMin: z.coerce.number().positive(),
  // Sem `.trim()` aqui: a rota original de atividades não aparava as notas
  // (diferente da de demandas, que sempre fez `.trim()`) — mantido como era.
  notes: z.string().optional(),
});

export const createDemandSchema = z.object({
  title: z.string().trim().min(1),
  client: z.string().trim().optional(),
  weight: z.nativeEnum(DemandWeight),
  completedAt: z.coerce.date(),
  notes: z.string().trim().optional(),
});

export const reviewActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().optional(),
});
