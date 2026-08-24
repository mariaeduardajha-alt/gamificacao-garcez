import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveProof } from "@/lib/storage";
import { computeActiveDaysStats } from "@/lib/scoring";
import { getActiveChallenge } from "@/lib/challenge";
import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { createActivitySchema } from "@/lib/schemas";
import { MAX_PROOF_SIZE_BYTES } from "@/lib/constants";

export const runtime = "nodejs";

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
  const { type, durationMin, notes } = parsed.data;
  const dateStr = form.get("date") as string;

  const file = form.get("proof") as File | null;
  if (file && file.size > MAX_PROOF_SIZE_BYTES) {
    return apiError("file_too_large");
  }

  const proofUrl = file && file.size > 0 ? await saveProof(session.user.id, file) : null;

  const activity = await prisma.activity.create({
    data: {
      userId: session.user.id,
      date: new Date(dateStr + "T12:00:00Z"),
      type,
      kcal: 0,
      durationMin,
      notes: notes ?? null,
      proofUrl,
      status: "APPROVED",
    },
  });

  // Calcula pontos ganhos e se houve bônus de constância
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
  const statsAfter = computeActiveDaysStats([
    ...prevActivities,
    { date: activity.date, durationMin: activity.durationMin },
  ]);
  const dayPointsGained = (statsAfter.activeDays - statsBefore.activeDays) * 10;
  const bonusGained = (statsAfter.weeksHitGoal - statsBefore.weeksHitGoal) * 20;

  return apiSuccess({ ok: true, id: activity.id, dayPointsGained, bonusGained });
});

export const GET = withApiHandler(async () => {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const items = await prisma.activity.findMany({
    where: { userId: authResult.session.user.id },
    orderBy: { date: "desc" },
  });
  return apiSuccess({ items });
});

export const DELETE = withApiHandler(async () => {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { count } = await prisma.activity.deleteMany({
    where: { userId: authResult.session.user.id },
  });
  return apiSuccess({ ok: true, deleted: count });
});
