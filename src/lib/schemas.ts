import { z } from "zod";
import { ActivityType, DemandWeight, Role } from "@prisma/client";

/**
 * Validação dos dados recebidos pelas rotas de API.
 *
 * Datas chegam do <input type="date"> como "AAAA-MM-DD" e são mantidas como
 * string aqui: a rota converte com `dateFromInput` (meio-dia UTC) para não
 * deslocar o dia por fuso horário.
 */
const inputDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalText = z.string().trim().optional();

export const createActivitySchema = z.object({
  date: inputDate,
  type: z.nativeEnum(ActivityType),
  durationMin: z.coerce.number().int().positive(),
  notes: optionalText,
});

export const createDemandSchema = z.object({
  title: z.string().trim().min(1),
  client: optionalText,
  weight: z.nativeEnum(DemandWeight),
  completedAt: inputDate,
  notes: optionalText,
});

export const reviewActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().optional(),
  weight: z.nativeEnum(DemandWeight).optional(),
});

const MIN_PASSWORD_LENGTH = 6;

export const createUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().min(1),
  sector: optionalText,
  role: z.nativeEnum(Role).default(Role.USER),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  sector: z.string().trim().optional(),
  role: z.nativeEnum(Role).optional(),
  password: z.string().min(MIN_PASSWORD_LENGTH).optional(),
});
