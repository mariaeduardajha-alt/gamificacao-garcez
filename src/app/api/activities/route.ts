import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveProof } from "@/lib/storage";
import { ActivityType } from "@prisma/client";
import { computeActiveDaysStats } from "@/lib/scoring";
import { getActiveChallenge } from "@/lib/challenge";

export const runtime = "nodejs";

const validTypes = new Set<ActivityType>([
  "CAMINHADA",
  "CORRIDA",
  "CICLISMO",
  "MUSCULACAO",
  "FUNCIONAL",
  "DANCA",
  "NATACAO",
  "ESPORTE",
  "TREINO_CASA",
  "TRILHA",
  "OUTRA"
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const dateStr = form.get("date") as string;
  const type = form.get("type") as ActivityType;
  const durationMin = form.get("durationMin") ? Number(form.get("durationMin")) : null;
  const notes = (form.get("notes") as string) || null;
  const file = form.get("proof") as File | null;

  if (!dateStr || !type || !validTypes.has(type) || !durationMin || durationMin <= 0) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (file && file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  const proofUrl = file && file.size > 0 ? await saveProof(session.user.id, file) : null;

  const activity = await prisma.activity.create({
    data: {
      userId: session.user.id,
      date: new Date(dateStr + "T12:00:00Z"),
      type,
      kcal: 0,
      durationMin,
      notes,
      proofUrl,
      status: "APPROVED"
    }
  });

  // Calcula pontos ganhos e se houve bônus de constância
  const challenge = await getActiveChallenge();
  const prevActivities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
      status: "APPROVED",
      id: { not: activity.id },
      date: { gte: challenge.startDate, lte: challenge.endDate }
    },
    select: { date: true, durationMin: true }
  });
  const statsBefore = computeActiveDaysStats(prevActivities);
  const statsAfter  = computeActiveDaysStats([
    ...prevActivities,
    { date: activity.date, durationMin: activity.durationMin }
  ]);
  const dayPointsGained = (statsAfter.activeDays    - statsBefore.activeDays)    * 10;
  const bonusGained     = (statsAfter.weeksHitGoal  - statsBefore.weeksHitGoal)  * 20;

  return NextResponse.json({ ok: true, id: activity.id, dayPointsGained, bonusGained });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const items = await prisma.activity.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" }
  });
  return NextResponse.json({ items });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { count } = await prisma.activity.deleteMany({
    where: { userId: session.user.id }
  });
  return NextResponse.json({ ok: true, deleted: count });
}
