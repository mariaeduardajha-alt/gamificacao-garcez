"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMAND_WEIGHTS, WEIGHT_COLOR, WEIGHT_LABEL, WEIGHT_POINTS } from "@/lib/game-rules";
import { formatDate } from "@/lib/format";
import type { DemandWeight } from "@prisma/client";
import type { DemandWithUserSerialized } from "@/types/domain";
import { useApiMutation } from "@/hooks/useApiMutation";

type Item = DemandWithUserSerialized;

/** Fila de demandas pendentes: o admin aprova (podendo ajustar o peso) ou rejeita. */
export function DemandsReviewList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [weightOverride, setWeightOverride] = useState<Record<string, DemandWeight>>({});
  const { mutate } = useApiMutation();

  async function review(item: Item, action: "APPROVE" | "REJECT") {
    setBusy(item.id);
    const weight = action === "APPROVE" ? weightOverride[item.id] : undefined;
    try {
      await mutate(`/api/demands/${item.id}/review`, { action, ...(weight ? { weight } : {}) });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao revisar demanda");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="val-card text-center py-16">
        <div className="font-display uppercase tracking-wider2 text-val-line">Sem demandas pendentes</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((it) => {
        const currentWeight = weightOverride[it.id] || it.weight;
        return (
          <div key={it.id} className="val-card grid md:grid-cols-[1fr_auto] gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display uppercase tracking-wider2 text-val-cream text-lg">{it.user.name}</span>
                <span className="font-mono text-val-line text-xs">{it.user.email}</span>
              </div>
              <div className="font-display text-xl text-val-cream">{it.title}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Cliente" value={it.client || "—"} />
                <Field label="Concluída em" value={formatDate(it.completedAt)} />
                <Field label="Pontos" value={`${WEIGHT_POINTS[currentWeight]} pts`} />
              </div>

              <div>
                <div className="font-display uppercase tracking-wider2 text-xs text-val-line mb-2">Peso (pode ajustar)</div>
                <div className="flex flex-wrap gap-2">
                  {DEMAND_WEIGHTS.map((w) => {
                    const active = w === currentWeight;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWeightOverride((p) => ({ ...p, [it.id]: w }))}
                        className="px-3 py-1 border font-display uppercase tracking-wider2 text-xs clip-notch"
                        style={{
                          color: WEIGHT_COLOR[w],
                          borderColor: active ? WEIGHT_COLOR[w] : `${WEIGHT_COLOR[w]}40`,
                          background: active ? `${WEIGHT_COLOR[w]}1A` : "transparent"
                        }}
                      >
                        {WEIGHT_LABEL[w]} · +{WEIGHT_POINTS[w]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {it.notes && (
                <div className="text-sm text-val-line font-mono border-l-2 border-val-red/50 pl-3">
                  {it.notes}
                </div>
              )}

              {it.proofUrl && (
                <a href={it.proofUrl} target="_blank" className="inline-block">
                  <img src={it.proofUrl} alt="print" className="max-h-48 border border-val-line/30 clip-notch hover:border-val-red transition-colors" />
                </a>
              )}
            </div>

            <div className="flex md:flex-col gap-2 items-center justify-center">
              <button onClick={() => review(it, "APPROVE")} disabled={busy === it.id} className="val-btn w-full">
                Aprovar
              </button>
              <button onClick={() => review(it, "REJECT")} disabled={busy === it.id} className="val-btn-outline w-full">
                Rejeitar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display uppercase tracking-wider2 text-xs text-val-line">{label}</div>
      <div className="font-mono text-val-cream text-sm mt-1">{value}</div>
    </div>
  );
}
