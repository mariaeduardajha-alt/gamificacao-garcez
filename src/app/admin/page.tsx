import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { DemandsReviewList } from "./DemandsReviewList";
import { AllActivitiesHistory } from "./AllActivitiesHistory";
import { EngagementCard, type PlayerEngagement } from "./EngagementCard";
import { isoWeekKey, computeActiveDaysStats } from "@/lib/scoring";
import { getActiveChallenge } from "@/lib/challenge";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const challenge = await getActiveChallenge();

  const [pendingDemands, allActivities, users] = await Promise.all([
    prisma.demand.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" }
    }),
    prisma.activity.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { date: "desc" }
    }),
    prisma.user.findMany({
      include: {
        activities: {
          where: { status: "APPROVED", date: { gte: challenge.startDate, lte: challenge.endDate } },
          select: { date: true, durationMin: true }
        }
      }
    })
  ]);

  // Semana atual e semanas decorridas do desafio
  const now            = new Date();
  const currentWeekKey = isoWeekKey(now);
  const challengeStart = new Date(challenge.startDate);
  const msPerWeek      = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks     = Math.max(1, Math.ceil((now.getTime() - challengeStart.getTime()) / msPerWeek));

  // Calcula engajamento por jogador
  const engagement: PlayerEngagement[] = users.map((u) => {
    const acts   = u.activities;
    const stats  = computeActiveDaysStats(acts);

    // Dias ativos só na semana atual
    const currentWeekDays = acts.filter((a) => {
      const dk = a.date.toISOString().slice(0, 10);
      return (a.durationMin ?? 0) >= 30 && isoWeekKey(new Date(dk + "T12:00:00Z")) === currentWeekKey;
    }).length;

    return {
      userId:          u.id,
      name:            u.name,
      avatarUrl:       u.avatarUrl,
      currentWeekDays,
      onTrack:         currentWeekDays >= 3,
      weeksHitGoal:    stats.weeksHitGoal,
      totalWeeks,
      activeDays:      stats.activeDays,
    };
  }).sort((a, b) => b.currentWeekDays - a.currentWeekDays || b.activeDays - a.activeDays);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="val-heading text-2xl sm:text-3xl">Central de Comando</h1>
            <p className="font-mono text-val-line text-xs uppercase tracking-wider2 mt-1">
              {allActivities.length} atividades registradas · {pendingDemands.length} demandas pendentes
            </p>
          </div>
          <Link href="/admin/usuarios" className="val-btn-outline w-full sm:w-auto">Gerenciar agentes</Link>
        </div>

        {/* Histórico de atividades */}
        <section className="space-y-4">
          <h2 className="val-heading text-xl">Histórico de Atividades</h2>
          <AllActivitiesHistory items={JSON.parse(JSON.stringify(allActivities))} />
        </section>

        {/* Demandas pendentes */}
        <section className="space-y-4">
          <h2 className="val-heading text-xl">Demandas ClickUp</h2>
          <DemandsReviewList items={JSON.parse(JSON.stringify(pendingDemands))} />
        </section>

        {/* Engajamento dos agentes */}
        <section className="space-y-4">
          <h2 className="val-heading text-xl">Engajamento dos Agentes</h2>
          <EngagementCard players={engagement} />
        </section>
      </main>
    </>
  );
}
