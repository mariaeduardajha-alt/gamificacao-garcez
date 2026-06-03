"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityActions } from "./ActivityActions";

interface Activity {
  id: string;
  date: string;
  type: string;
  durationMin: number | null;
  status: string;
  proofUrl: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  APPROVED: "#2DD4BF",
  PENDING:  "#F0C040",
  REJECTED: "#FF4655",
};
const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Aprovada",
  PENDING:  "Pendente",
  REJECTED: "Rejeitada",
};

export function MinhasTable({ activities }: { activities: Activity[] }) {
  const router   = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const allChecked  = activities.length > 0 && selected.size === activities.length;
  const someChecked = selected.size > 0 && !allChecked;

  function toggleAll() {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(activities.map((a) => a.id)));
    }
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
    await Promise.all(
      [...selected].map((id) => fetch(`/api/activities/${id}`, { method: "DELETE" }))
    );
    setDeleting(false);
    setSelected(new Set());
    router.refresh();
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
          style={{
            background: "rgba(255,70,85,0.07)",
            borderBottom: "1px solid rgba(255,70,85,0.20)",
          }}
        >
          <span className="font-mono text-xs uppercase tracking-wider2"
            style={{ color: "rgba(255,70,85,0.8)" }}>
            {selected.size} selecionado{selected.size !== 1 ? "s" : ""}
          </span>
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider2 px-3 py-1.5 transition-colors"
            style={{
              background: "rgba(255,70,85,0.15)",
              border: "1px solid rgba(255,70,85,0.40)",
              color: "#FF4655",
            }}
          >
            <svg viewBox="0 0 16 18" width="11" height="13" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4h14M6 4V2h4v2M5 4v10a1 1 0 001 1h4a1 1 0 001-1V4" />
              <line x1="7" y1="7" x2="7" y2="12" /><line x1="9" y1="7" x2="9" y2="12" />
            </svg>
            {deleting ? "Excluindo…" : "Excluir selecionados"}
          </button>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="border-b border-val-line/30">
            {/* Checkbox selecionar todos */}
            <th className="px-4 py-3 w-10">
              <Checkbox
                checked={allChecked}
                indeterminate={someChecked}
                onChange={toggleAll}
              />
            </th>
            <Th>Data</Th>
            <Th>Tipo</Th>
            <Th className="text-right">Duração</Th>
            <Th>Status</Th>
            <Th>Print / Ações</Th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => {
            const isSelected = selected.has(a.id);
            const color = STATUS_COLOR[a.status] ?? "#D4DCF0";
            return (
              <tr
                key={a.id}
                className="border-b border-val-line/10 transition-colors"
                style={{
                  background: isSelected ? "rgba(61,127,255,0.06)" : undefined,
                }}
              >
                <td className="px-4 py-3 w-10">
                  <Checkbox checked={isSelected} onChange={() => toggle(a.id)} />
                </td>
                <td className="px-4 py-3 font-mono text-sm text-val-cream">
                  {new Date(a.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </td>
                <td className="px-4 py-3 font-display uppercase tracking-wider2 text-sm text-val-cream">
                  {a.type.replace("_", " ")}
                </td>
                <td className="px-4 py-3 font-mono text-right text-sm text-val-cream">
                  {a.durationMin ? `${a.durationMin} min` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5"
                    style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
                  >
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ActivityActions id={a.id} proofUrl={a.proofUrl} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
        <svg viewBox="0 0 10 2" width="9" height="2" fill="none"
          stroke="#3D7FFF" strokeWidth="2" strokeLinecap="round">
          <path d="M1 1h8" />
        </svg>
      )}
    </button>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line ${className ?? ""}`}>
      {children}
    </th>
  );
}
