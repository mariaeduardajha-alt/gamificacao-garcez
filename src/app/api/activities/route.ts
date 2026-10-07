import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUpload, isAllowedImage, MAX_PROOF_SIZE_BYTES } from "@/lib/storage";
import { computeActiveDaysStats } from "@/lib/scoring";
import { POINTS_PER_ACTIVE_DAY, CONSTANCY_BONUS_POINTS } from "@/lib/game-rules";
import { getActiveChallenge } from "@/lib/challenge";
import { dateFromInput } from "@/lib/format";
import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { createActivitySchema } from "@/lib/schemas";

export const runtime = "nodejs";

/** Registra um exercício (já aprovado) e devolve os pontos ganhos com ele. */
export const POST = withApiHandler(async (req: NextRequest) => {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  const form = await req.formData();
  const parsed = createActivitySchema.safeParse({
    date: form.get("date"),
    type: form.get("type"),
    durationMin: form.get("durationMin"),
    notes: form.get("notes") || undefined,
  });
  if (!parsed.success) return apiError("invalid_input");
  const { date, type, durationMin, notes } = parsed.data;

  const file = form.get("proof") as File | null;
  const hasFile = !!file && file.size > 0;
  if (hasFile && file.size > MAX_PROOF_SIZE_BYTES) return apiError("file_too_large");
  if (hasFile && !isAllowedImage(file)) return apiError("invalid_file");

  const proofUrl = hasFile ? await saveUpload(session.user.id, file) : null;

  const activity = await prisma.activity.create({
    data: {
      userId: session.user.id,
      date: dateFromInput(date),
      type,
      durationMin,
      notes: notes ?? null,
      proofUrl,
      status: "APPROVED",
    },
  });

  // Pontos ganhos com este registro: compara as estatísticas antes e depois dele
  const challenge = await getActiveChallenge();
  const prevActivities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
      status: "APPROVED",
      id: { not: activity.id },
      date: { gte: challenge.startDate, lte: challenge.endDate },
    },
    select: { date: true, durationMin: true },
  });
  const statsBefore = computeActiveDaysStats(prevActivities);
  const statsAfter = computeActiveDaysStats([...prevActivities, activity]);
  const dayPointsGained = (statsAfter.activeDays - statsBefore.activeDays) * POINTS_PER_ACTIVE_DAY;
  const bonusGained = (statsAfter.weeksHitGoal - statsBefore.weeksHitGoal) * CONSTANCY_BONUS_POINTS;

  // Total de minutos já registrados no dia (para o aviso de "faltam X min")
  const dayKey = activity.date.toISOString().slice(0, 10);
  const dayMinutes = [...prevActivities, activity]
    .filter((a) => a.date.toISOString().slice(0, 10) === dayKey)
    .reduce((s, a) => s + (a.durationMin ?? 0), 0);

  return apiSuccess({ ok: true, id: activity.id, dayPointsGained, bonusGained, dayMinutes });
});
