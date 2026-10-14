import { requireSession } from "@/lib/auth";
import { buildSnapshot } from "@/lib/challenge";
import { TIER_COLOR } from "@/lib/tiers";
import { formatMonthRange } from "@/lib/format";
import { SectionHeader } from "@/components/SectionHeader";
import { SectorGoalCard } from "@/components/SectorGoalCard";

export const dynamic = "force-dynamic";

export default async function MetaDoSetoresPage() {
  await requireSession();

  const s = await buildSnapshot();

  return (
    <>
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
              className="val-heading mt-1 text-gradient"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                backgroundImage: "linear-gradient(135deg, #D4DCF0 30%, #C9A84C 70%, #F0C040 100%)",
              }}
            >
              Meta dos Setores
            </h1>
            <p className="font-mono text-rpg-textDim text-xs uppercase tracking-wider2 mt-1">
              {formatMonthRange(s.challenge.startDate, s.challenge.endDate)} · Desempenho por área
            </p>
          </div>
        </section>

        {/* Cards dos setores */}
        <section>
          <SectionHeader
            icon="🛡"
            title="Metas por Setor"
            subtitle="Indicadores individuais · Bronze / Prata / Ouro"
            color="#C9A84C"
          />

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
          <div className="font-mono text-[10px] uppercase tracking-wider2 text-rpg-textDim text-center py-4 space-x-6">
            <span style={{ color: TIER_COLOR.BRONZE }}>◆ Bronze = meta mínima</span>
            <span style={{ color: TIER_COLOR.SILVER }}>◆ Prata = meta intermediária</span>
            <span style={{ color: TIER_COLOR.GOLD }}>◆ Ouro = meta máxima</span>
          </div>
        </section>

      </main>
    </>
  );
}
