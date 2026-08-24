"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";

export interface ReviewListProps<T> {
  items: T[];
  getId: (item: T) => string;
  /** Monta a URL de revisão a partir do id (ex: `/api/activities/${id}/review`). */
  endpoint: (id: string) => string;
  emptyMessage: string;
  /** Mensagem de fallback quando a revisão falha e o erro não tem uma mensagem própria. */
  errorMessage: string;
  /** Conteúdo específico da entidade (nome do agente, campos, print, notas...). */
  renderItem: (item: T) => ReactNode;
  /** Campos extras do corpo da requisição de revisão (ex: `weight` em demandas). */
  buildReviewBody?: (item: T, action: "APPROVE" | "REJECT") => Record<string, unknown>;
}

/**
 * Fila de revisão genérica (aprovar/rejeitar) — antes duplicada quase
 * verbatim entre `AdminList.tsx` (atividades) e `DemandsReviewList.tsx`
 * (demandas), cada uma com seu próprio `busy`/fetch/router.refresh().
 */
export function ReviewList<T>({
  items,
  getId,
  endpoint,
  emptyMessage,
  errorMessage,
  renderItem,
  buildReviewBody,
}: ReviewListProps<T>) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const { mutate } = useApiMutation();

  async function review(item: T, action: "APPROVE" | "REJECT") {
    const id = getId(item);
    setBusy(id);
    const body = { action, ...(buildReviewBody?.(item, action) ?? {}) };
    try {
      await mutate(endpoint(id), body);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : errorMessage);
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="val-card text-center py-16">
        <div className="font-display uppercase tracking-wider2 text-val-line">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const id = getId(item);
        return (
          <div key={id} className="val-card grid md:grid-cols-[1fr_auto] gap-6">
            <div className="space-y-3">{renderItem(item)}</div>

            <div className="flex md:flex-col gap-2 items-center justify-center">
              <button
                onClick={() => review(item, "APPROVE")}
                disabled={busy === id}
                className="val-btn w-full"
              >
                Aprovar
              </button>
              <button
                onClick={() => review(item, "REJECT")}
                disabled={busy === id}
                className="val-btn-outline w-full"
              >
                Rejeitar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Par label/valor usado dentro de `renderItem` — mesmo estilo das duas filas. */
export function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display uppercase tracking-wider2 text-xs text-val-line">{label}</div>
      <div className="font-mono text-val-cream text-sm mt-1">{value}</div>
    </div>
  );
}
