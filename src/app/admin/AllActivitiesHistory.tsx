"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { ActivityWithUserSerialized } from "@/types/domain";
import { useApiMutation } from "@/hooks/useApiMutation";
import { ACTIVITY_TYPE_LABEL } from "@/lib/game-rules";
import { formatDate } from "@/lib/format";
import { Th } from "@/components/table/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { TrashIcon, ChevronIcon } from "@/components/icons";

type Item = ActivityWithUserSerialized;

const PAGE_SIZE = 3;

/** Histórico de atividades de todos os agentes (admin): filtro, observações e exclusão. */
export function AllActivitiesHistory({ items }: { items: Item[] }) {
  const router = useRouter();
  const [busy,      setBusy]      = useState<string | null>(null);
  const [filter,    setFilter]    = useState("");
  const [expanded,  setExpanded]  = useState(false);
  const [openNotes, setOpenNotes] = useState<string | null>(null);
  const { mutate } = useApiMutation();

  async function handleDelete(id: string) {
    if (!confirm("Excluir este registro?")) return;
    setBusy(id);
    try {
      await mutate(`/api/activities/${id}`, undefined, "DELETE");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao excluir registro");
    } finally {
      setBusy(null);
    }
  }

  const term = filter.trim().toLowerCase();
  const filtered = term
    ? items.filter((it) => it.user.name.toLowerCase().includes(term) || it.user.email.toLowerCase().includes(term))
    : items;

  const visible = expanded ? filtered : filtered.slice(0, PAGE_SIZE);
  const hasMore = filtered.length > PAGE_SIZE;

  if (items.length === 0) {
    return (
      <div className="val-card text-center py-10 font-mono text-val-line uppercase tracking-wider2 text-sm">
        Nenhuma atividade registrada ainda.
      </div>
    );
  }

  /** Nome + e-mail do agente; clicável para abrir as observações, se houver. */
  const renderAgentName = (it: Item) => {
    const isOpen = openNotes === it.id;
    const hasNotes = !!it.notes?.trim();
    return (
      <button
        onClick={() => hasNotes && setOpenNotes(isOpen ? null : it.id)}
        className="min-w-0 text-left"
        style={{ cursor: hasNotes ? "pointer" : "default" }}
      >
        <div className="flex items-center gap-1 font-display uppercase tracking-wider2 text-xs break-words"
          style={{ color: isOpen ? "#3D7FFF" : "#D4DCF0" }}>
          {it.user.name}
          {hasNotes && (
            <span style={{ color: isOpen ? "#3D7FFF" : "rgba(61,127,255,0.5)" }}>
              <ChevronIcon open={isOpen} />
            </span>
          )}
        </div>
        <div className="font-mono text-[10px] text-val-line break-all">{it.user.email}</div>
      </button>
    );
  };

  const renderDeleteButton = (id: string) => (
    <button
      onClick={() => handleDelete(id)}
      disabled={busy === id}
      title="Excluir"
      className="flex items-center justify-center w-7 h-7 rounded hover:bg-red-500/15 transition-colors"
      style={{ color: busy === id ? "rgba(255,255,255,0.2)" : "rgba(255,70,85,0.65)" }}
    >
      <TrashIcon />
    </button>
  );

  return (
    <div className="space-y-3">

      {/* Filtro */}
      <div className="relative" style={{ maxWidth: 280 }}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(61,127,255,0.6)" }}>
          <svg viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="7.5" cy="7.5" r="5.5" />
            <path d="M13 13l3 3" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Filtrar por agente..."
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setExpanded(false); }}
          className="val-input pl-9 text-sm w-full"
        />
        {filter && (
          <button
            onClick={() => { setFilter(""); setExpanded(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}
          >×</button>
        )}
      </div>

      <div className="val-card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center font-mono text-val-line uppercase tracking-wider2 text-xs">
            Nenhum resultado para &ldquo;{filter}&rdquo;
          </div>
        ) : (
          <>
            {/* ── Desktop: tabela ── */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-val-line/30">
                    {["Agente", "Data", "Tipo", "Duração", "Status", "Print", ""].map((h) => <Th key={h}>{h}</Th>)}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((it) => {
                    const isOpen = openNotes === it.id && !!it.notes?.trim();
                    return (
                      <React.Fragment key={it.id}>
                        <tr className="hover:bg-val-bgDark/40"
                          style={{ borderBottom: isOpen ? "none" : "1px solid rgba(61,127,255,0.08)" }}>
                          <td className="px-4 py-3">{renderAgentName(it)}</td>
                          <td className="px-4 py-3 font-mono text-sm text-val-cream">{formatDate(it.date)}</td>
                          <td className="px-4 py-3 font-display uppercase tracking-wider2 text-sm text-val-cream">
                            {ACTIVITY_TYPE_LABEL[it.type]}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-val-cream">
                            {it.durationMin ? `${it.durationMin} min` : "—"}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={it.status} /></td>
                          <td className="px-4 py-3">
                            {it.proofUrl ? (
                              <a href={it.proofUrl} target="_blank" className="font-display uppercase tracking-wider2 text-xs" style={{ color: "#3D7FFF" }}>
                                Ver
                              </a>
                            ) : (
                              <span className="text-val-line text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">{renderDeleteButton(it.id)}</td>
                        </tr>
                        {isOpen && (
                          <tr style={{ borderBottom: "1px solid rgba(61,127,255,0.08)" }}>
                            <td colSpan={7} className="px-4 pb-3 pt-0"><NotesPanel notes={it.notes!} /></td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile: lista de cards ── */}
            <div className="md:hidden divide-y divide-val-line/10">
              {visible.map((it) => (
                <div key={it.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    {renderAgentName(it)}
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={it.status} />
                      {renderDeleteButton(it.id)}
                    </div>
                  </div>

                  <div className="font-mono text-[11px] text-rpg-textDim mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-val-cream">{formatDate(it.date)}</span>
                    <span>·</span>
                    <span className="font-display uppercase tracking-wider2 text-val-cream">{ACTIVITY_TYPE_LABEL[it.type]}</span>
                    <span>·</span>
                    <span>{it.durationMin ? `${it.durationMin} min` : "—"}</span>
                    {it.proofUrl && (
                      <a href={it.proofUrl} target="_blank" className="font-display uppercase tracking-wider2 text-xs ml-1" style={{ color: "#3D7FFF" }}>
                        · Ver print
                      </a>
                    )}
                  </div>

                  {openNotes === it.id && it.notes?.trim() && (
                    <div className="mt-2"><NotesPanel notes={it.notes} /></div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mostrar mais / menos */}
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider2 transition-colors"
          style={{ color: "rgba(61,127,255,0.8)" }}
        >
          <ChevronIcon open={expanded} size={13} />
          {expanded ? "Mostrar menos" : `Mostrar mais (${filtered.length - PAGE_SIZE} restantes)`}
        </button>
      )}

    </div>
  );
}

/** Caixa com a observação da atividade. */
function NotesPanel({ notes }: { notes: string }) {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2 font-mono text-xs"
      style={{ background: "rgba(61,127,255,0.05)", border: "1px solid rgba(61,127,255,0.15)", borderLeft: "3px solid rgba(61,127,255,0.55)" }}
    >
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        style={{ color: "#3D7FFF", marginTop: 1, flexShrink: 0 }}>
        <path d="M2 4h12M2 8h8M2 12h6" />
      </svg>
      <span style={{ color: "rgba(212,220,240,0.8)", lineHeight: 1.5 }}>{notes}</span>
    </div>
  );
}
