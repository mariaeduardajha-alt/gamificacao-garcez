"use client";

import type { ActivityWithUserSerialized } from "@/types/domain";
import { ReviewList, ReviewField } from "@/components/ReviewList";

type Item = ActivityWithUserSerialized;

export function AdminList({ items }: { items: Item[] }) {
  return (
    <ReviewList<Item>
      items={items}
      getId={(it) => it.id}
      endpoint={(id) => `/api/activities/${id}/review`}
      emptyMessage="Fila limpa. Nenhuma atividade pendente."
      errorMessage="Falha ao revisar atividade"
      renderItem={(it) => (
        <>
          <div className="flex items-center gap-3">
            <span className="font-display uppercase tracking-wider2 text-val-cream text-lg">
              {it.user.name}
            </span>
            <span className="font-mono text-val-line text-xs">{it.user.email}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ReviewField label="Data" value={new Date(it.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} />
            <ReviewField label="Tipo" value={it.type.replace("_", " ")} />
            <ReviewField label="Duração" value={it.durationMin ? `${it.durationMin} min` : "—"} />
          </div>
          {it.notes && (
            <div className="text-sm text-val-line font-mono border-l-2 border-val-red/50 pl-3 mt-2">
              {it.notes}
            </div>
          )}
          {it.proofUrl && (
            <a href={it.proofUrl} target="_blank" className="inline-block">
              <img
                src={it.proofUrl}
                alt="print"
                className="max-h-48 border border-val-line/30 clip-notch hover:border-val-red transition-colors"
              />
            </a>
          )}
        </>
      )}
    />
  );
}
