import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { MinhasTable } from "@/components/MinhasTable";

export const dynamic = "force-dynamic";

export default async function MinhasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const activities = await prisma.activity.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" }
  });

  const approved   = activities.filter((a) => a.status === "APPROVED");
  const activeDays = new Set(
    approved.filter((a) => (a.durationMin ?? 0) >= 30).map((a) => a.date.toISOString().slice(0, 10))
  ).size;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="val-heading text-2xl sm:text-3xl">Minhas atividades</h1>
            <p className="font-mono text-val-line text-xs uppercase tracking-wider2 mt-1">
              {approved.length} aprovadas · {activeDays} dias ativos
            </p>
          </div>
          <Link href="/registrar" className="val-btn-danger w-full sm:w-auto">+ Nova atividade</Link>
        </div>

        <div className="val-card p-0 overflow-hidden">
          <MinhasTable activities={JSON.parse(JSON.stringify(activities))} />
        </div>
      </main>
    </>
  );
}
