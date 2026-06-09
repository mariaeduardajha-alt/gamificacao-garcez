import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildSnapshot } from "@/lib/challenge";
import { Navbar } from "@/components/Navbar";
import { SectorGoalCard } from "@/components/SectorGoalCard";

export const dynamic = "force-dynamic";

export default async function MetaDoSetoresPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const s = await buildSnapshot();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-10">

        {/* Header */}
        <section className="relative overflow-hidden val-card">
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.8), rgba(240,192,48,0.6), transparent)"
            }}
          />
          <div>
            <div
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider2"
              style={{ color: "#C9A84C" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C9A84C", boxShadow: "0 0 6px #C9A84C" }} />
              Indicadores individuais · Garcez Consultoria Jurídica
            </div>
            <h1
              className="val-heading mt-1"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                background: "linear-gradient(135deg, #D4DCF0 30%, #C9A84C 70%, #F0C040 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Meta dos Setores
            </h1>
            <p className="font-mono text-rpg-textDim text-xs uppercase tracking-wider2 mt-1">
              Jun–Jul 2026 · Desempenho por área
            </p>
          </div>
        </section>

        {/* Cards dos setores */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full" style={{ background: "#C9A84C" }} />
            <div>
              <h2 className="val-heading text-2xl md:text-3xl">
                <span className="mr-2 text-xl">🛡</span>Metas por Setor
              </h2>
              <p className="font-mono text-rpg-textDim text-xs uppercase tracking-wider2 mt-0.5">
                Indicadores individuais · Bronze / Prata / Ouro
              </p>
            </div>
          </div>

          {s.sectorGoals.length === 0 ? (
            <div className="val-card text-center font-mono text-rpg-textDim text-sm py-12">
              Nenhuma meta de setor cadastrada ainda.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {s.sectorGoals.map((goal) => (
                <SectorGoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </section>

        {/* Legenda */}
        <section>
          <div
            className="font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim text-center py-4 space-x-6"
          >
            <span style={{ color: "#C07030" }}>◆ Bronze = meta mínima</span>
            <span style={{ color: "#8FA8C8" }}>◆ Prata = meta intermediária</span>
            <span style={{ color: "#F0C040" }}>◆ Ouro = meta máxima</span>
          </div>
        </section>

      </main>
    </>
  );
}
