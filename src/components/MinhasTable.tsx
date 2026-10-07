"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ActivityRecordSerialized } from "@/types/domain";
import { useApiMutation } from "@/hooks/useApiMutation";
import { ACTIVITY_TYPE_LABEL } from "@/lib/game-rules";
import { formatDate } from "@/lib/format";
import { Th } from "@/components/table/Table";
import { StatusBadge } from "./StatusBadge";
import { ActivityActions } from "./ActivityActions";
import { TrashIcon } from "./icons";

type Activity = ActivityRecordSerialized;

/** Histórico de atividades do próprio usuário, com seleção e exclusão em lote. */
export function MinhasTable({ activities }: { activities: Activity[] }) {
  const router   = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const { mutate } = useApiMutation();

  const allChecked  = activities.length > 0 && selected.size === activities.length;
  const someChecked = selected.size > 0 && !allChecked;

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(activities.map((a) => a.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function deleteSelected() {
    if (!confirm(`Excluir ${selected.size} registro(s)?`)) return;
    setDeleting(true);
    const results = await Promise.allSettled(
      [...selected].map((id) => mutate(`/api/activities/${id}`, undefined, "DELETE"))
    );
    setDeleting(false);
    setSelected(new Set());
    router.refresh();
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) alert(`Falha ao excluir ${failed} registro(s)`);
  }

  if (activities.length === 0) {
    return (
      <div className="p-10 text-center font-mono text-val-line uppercase tracking-wider2 text-sm">
        Nenhuma atividade registrada
      </div>
    );
  }

  return (
    <>
      {/* Barra de ações quando há selecionados */}
      {selected.size > 0 && (
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ background: "rgba(255,70,85,0.07)", borderBottom: "1px solid rgba(255,70,85,0.20)" }}
        >
          <span className="font-mono text-xs uppercase tracking-wider2" style={{ color: "rgba(255,70,85,0.8)" }}>
            {selected.size} selecionado{selected.size !== 1 ? "s" : ""}
          </span>
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider2 px-3 py-1.5 transition-colors"
            style={{ background: "rgba(255,70,85,0.15)", border: "1px solid rgba(255,70,85,0.40)", color: "#FF4655" }}
          >
            <TrashIcon size={11} />
            {deleting ? "Excluindo…" : "Excluir selecionados"}
          </button>
        </div>
      )}

      {/* ── Desktop: tabela ── */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-val-line/30">
              <th className="px-4 py-3 w-10">
                <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
              </th>
              <Th>Data</Th>
              <Th>Tipo</Th>
              <Th className="text-right">Duração</Th>
              <Th>Status</Th>
              <Th>Print / Ações</Th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr
                key={a.id}
                className="border-b border-val-line/10 transition-colors"
                style={{ background: selected.has(a.id) ? "rgba(61,127,255,0.06)" : undefined }}
              >
                <td className="px-4 py-3 w-10">
                  <Checkbox checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
                </td>
                <td className="px-4 py-3 font-mono text-sm text-val-cream">{formatDate(a.date)}</td>
                <td className="px-4 py-3 font-display uppercase tracking-wider2 text-sm text-val-cream">
                  {ACTIVITY_TYPE_LABEL[a.type]}
                </td>
                <td className="px-4 py-3 font-mono text-right text-sm text-val-cream">
                  {a.durationMin ? `${a.durationMin} min` : "—"}
                </td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3"><ActivityActions id={a.id} proofUrl={a.proofUrl} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: lista de cards ── */}
      <div className="md:hidden divide-y divide-val-line/10">
        {activities.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 px-4 py-3"
            style={{ background: selected.has(a.id) ? "rgba(61,127,255,0.06)" : undefined }}
          >
            <div className="pt-0.5 shrink-0">
              <Checkbox checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className="font-display uppercase tracking-wider2 text-sm text-val-cream break-words">
                  {ACTIVITY_TYPE_LABEL[a.type]}
                </span>
                <StatusBadge status={a.status} className="shrink-0" />
              </div>
              <div className="font-mono text-[11px] text-rpg-textDim mt-1">
                {formatDate(a.date)} · {a.durationMin ? `${a.durationMin} min` : "—"}
              </div>
              <div className="mt-2">
                <ActivityActions id={a.id} proofUrl={a.proofUrl} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Checkbox estilizado ─────────────────────────────────────── */
function Checkbox({
  checked, indeterminate = false, onChange,
}: { checked: boolean; indeterminate?: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-center w-4 h-4 transition-all"
      style={{
        border: `1.5px solid ${checked || indeterminate ? "#3D7FFF" : "rgba(61,127,255,0.30)"}`,
        background: checked || indeterminate ? "rgba(61,127,255,0.20)" : "transparent",
        borderRadius: 3,
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg viewBox="0 0 10 8" width="9" height="7" fill="none"
          stroke="#3D7FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 4l3 3 5-6" />
        </svg>
      )}
      {indeterminate && !checked && (
        <svg viewBox="0 0 10 2" width="9" height="2" fill="none" stroke="#3D7FFF" strokeWidth="2" strokeLinecap="round">
          <path d="M1 1h8" />
        </svg>
      )}
    </button>
  );
}
