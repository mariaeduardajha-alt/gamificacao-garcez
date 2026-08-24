"use client";

import { useState } from "react";
import { WEIGHT_COLOR, WEIGHT_LABEL, WEIGHT_POINTS } from "@/lib/scoring";
import type { DemandWeight } from "@prisma/client";
import type { DemandWithUserSerialized } from "@/types/domain";
import { ReviewList, ReviewField } from "@/components/ReviewList";

type Item = DemandWithUserSerialized;

const weights: DemandWeight[] = ["SMALL", "MEDIUM", "LARGE", "EPIC"];

export function DemandsReviewList({ items }: { items: Item[] }) {
  const [weightOverride, setWeightOverride] = useState<Record<string, DemandWeight>>({});

  return (
    <ReviewList<Item>
      items={items}
      getId={(it) => it.id}
      endpoint={(id) => `/api/demands/${id}/review`}
      emptyMessage="Sem demandas pendentes"
      errorMessage="Falha ao revisar demanda"
      buildReviewBody={(it, action) =>
        action === "APPROVE" && weightOverride[it.id] ? { weight: weightOverride[it.id] } : {}
      }
      renderItem={(it) => {
        const currentWeight = weightOverride[it.id] || it.weight;
        return (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-display uppercase tracking-wider2 text-val-cream text-lg">{it.user.name}</span>
              <span className="font-mono text-val-line text-xs">{it.user.email}</span>
            </div>
            <div className="font-display text-xl text-val-cream">{it.title}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ReviewField label="Cliente" value={it.client || "—"} />
              <ReviewField label="Concluída em" value={new Date(it.completedAt).toLocaleDateString("pt-BR")} />
              <ReviewField label="Pontos" value={`${WEIGHT_POINTS[currentWeight]} pts`} />
            </div>

            <div>
              <div className="font-display uppercase tracking-wider2 text-xs text-val-line mb-2">Peso (pode ajustar)</div>
              <div className="flex flex-wrap gap-2">
                {weights.map((w) => {
                  const active = w === currentWeight;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeightOverride((p) => ({ ...p, [it.id]: w }))}
                      className={`px-3 py-1 border font-display uppercase tracking-wider2 text-xs clip-notch`}
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
          </>
        );
      }}
    />
  );
}
