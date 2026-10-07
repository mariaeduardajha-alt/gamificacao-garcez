import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSnapshot } from "@/lib/challenge";
import { isoWeekKey, activeDaysInWeek } from "@/lib/scoring";
import { WEEKLY_GOAL_DAYS } from "@/lib/game-rules";
import { Navbar } from "@/components/Navbar";
import { DemandsReviewList } from "./DemandsReviewList";
import { AllActivitiesHistory } from "./AllActivitiesHistory";
import { EngagementCard, type PlayerEngagement } from "./EngagementCard";

export const dynamic = "force-dynamic";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export default async function AdminPage() {
  await requireAdminSession();

  const [snapshot, pendingDemands, allActivities] = await Promise.all([
    buildSnapshot(),
    prisma.demand.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" }
    }),
    prisma.activity.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { date: "desc" }
    })
  ]);

  // Semana atual e semanas decorridas do desafio
  const now            = new Date();
  const currentWeekKey = isoWeekKey(now);
  const totalWeeks     = Math.max(1, Math.ceil((now.getTime() - snapshot.challenge.startDate.getTime()) / MS_PER_WEEK));

  const engagement: PlayerEngagement[] = snapshot.players
    .map((p) => {
      const currentWeekDays = activeDaysInWeek(p.activeDayKeys, currentWeekKey);
      return {
        userId:       p.userId,
        name:         p.name,
        avatarUrl:    p.avatarUrl,
        currentWeekDays,
        onTrack:      currentWeekDays >= WEEKLY_GOAL_DAYS,
        weeksHitGoal: p.weeksHitGoal,
        totalWeeks,
        activeDays:   p.activeDays,
      };
    })
    .sort((a, b) => b.currentWeekDays - a.currentWeekDays || b.activeDays - a.activeDays);

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

        <section className="space-y-4">
          <h2 className="val-heading text-xl">Histórico de Atividades</h2>
          <AllActivitiesHistory items={JSON.parse(JSON.stringify(allActivities))} />
        </section>

        <section className="space-y-4">
          <h2 className="val-heading text-xl">Demandas pendentes</h2>
          <DemandsReviewList items={JSON.parse(JSON.stringify(pendingDemands))} />
        </section>

        <section className="space-y-4">
          <h2 className="val-heading text-xl">Engajamento dos Agentes</h2>
          <EngagementCard players={engagement} />
        </section>
      </main>
    </>
  );
}
