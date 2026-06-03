import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { WEIGHT_COLOR, WEIGHT_LABEL } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function DemandasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const demands = await prisma.demand.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: "desc" }
  });

  const approved = demands.filter((d) => d.status === "APPROVED");
  const totalPts = approved.reduce((s, d) => s + d.points, 0);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="val-heading text-3xl">Minhas demandas</h1>
            <p className="font-mono text-val-line text-xs uppercase tracking-wider2 mt-1">
              {approved.length} aprovadas · {totalPts} pts acumulados
            </p>
          </div>
          <Link href="/demandas/nova" className="val-btn-danger">+ Nova demanda</Link>
        </div>

        <div className="val-card p-0 overflow-hidden">
          {demands.length === 0 ? (
            <div className="p-10 text-center font-mono text-val-line uppercase tracking-wider2 text-sm">
              Nenhuma demanda registrada
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-val-line/30">
                  <Th>Data</Th>
                  <Th>Demanda</Th>
                  <Th>Cliente</Th>
                  <Th>Peso</Th>
                  <Th className="text-right">Pts</Th>
                  <Th>Status</Th>
                  <Th>Print</Th>
                </tr>
              </thead>
              <tbody>
                {demands.map((d) => (
                  <tr key={d.id} className="border-b border-val-line/10 hover:bg-val-bgDark/40">
                    <Td className="font-mono">{d.completedAt.toLocaleDateString("pt-BR")}</Td>
                    <Td className="text-val-cream">{d.title}</Td>
                    <Td className="font-mono text-val-line">{d.client || "—"}</Td>
                    <Td>
                      <span
                        className="font-display uppercase tracking-wider2 text-[10px] px-2 py-1 border"
                        style={{ color: WEIGHT_COLOR[d.weight], borderColor: `${WEIGHT_COLOR[d.weight]}80` }}
                      >
                        {WEIGHT_LABEL[d.weight]}
                      </span>
                    </Td>
                    <Td className="font-mono text-right text-val-cream">{d.points}</Td>
                    <Td><StatusBadge status={d.status} /></Td>
                    <Td>
                      {d.proofUrl ? (
                        <a href={d.proofUrl} target="_blank" className="text-val-red hover:underline font-display uppercase tracking-wider2 text-xs">Ver</a>
                      ) : (
                        <span className="text-val-line text-xs">—</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line ${className || ""}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className || ""}`}>{children}</td>;
}
