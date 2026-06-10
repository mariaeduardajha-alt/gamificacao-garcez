"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Item {
  id: string;
  date: string;
  type: string;
  durationMin: number | null;
  notes: string | null;
  proofUrl: string | null;
  status: string;
  user: { name: string; email: string };
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  APPROVED: { label: "Aprovada", color: "#2DD4BF" },
  PENDING:  { label: "Pendente", color: "#F0C040" },
  REJECTED: { label: "Rejeitada", color: "#FF4655" },
};

const PAGE_SIZE = 3;

export function AllActivitiesHistory({ items }: { items: Item[] }) {
  const router = useRouter();
  const [busy,      setBusy]      = useState<string | null>(null);
  const [filter,    setFilter]    = useState("");
  const [expanded,  setExpanded]  = useState(false);
  const [openNotes, setOpenNotes] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Excluir este registro?")) return;
    setBusy(id);
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  const filtered = filter.trim()
    ? items.filter((it) =>
        it.user.name.toLowerCase().includes(filter.toLowerCase()) ||
        it.user.email.toLowerCase().includes(filter.toLowerCase())
      )
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

  return (
    <div className="space-y-3">

      {/* Filtro */}
      <div className="relative" style={{ maxWidth: 280 }}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgba(61,127,255,0.6)" }}>
          <svg viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor"
            strokeWidth="1.6" strokeLinecap="round">
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

      {/* Tabela */}
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
                {["Agente", "Data", "Tipo", "Duração", "Status", "Print", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((it) => {
                const st       = STATUS_STYLE[it.status] ?? { label: it.status, color: "#D4DCF0" };
                const isOpen   = openNotes === it.id;
                const hasNotes = !!it.notes?.trim();

                return (
                  <React.Fragment key={it.id}>

                    {/* Linha principal */}
                    <tr className="hover:bg-val-bgDark/40"
                      style={{ borderBottom: isOpen ? "none" : "1px solid rgba(61,127,255,0.08)" }}>

                      {/* Agente — clicável se tiver notas */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => hasNotes && setOpenNotes(isOpen ? null : it.id)}
                          style={{ cursor: hasNotes ? "pointer" : "default", textAlign: "left" }}
                        >
                          <div className="flex items-center gap-1 font-display uppercase tracking-wider2 text-xs"
                            style={{ color: isOpen ? "#3D7FFF" : "#D4DCF0" }}>
                            {it.user.name}
                            {hasNotes && (
                              <svg viewBox="0 0 10 10" width="9" height="9" fill="none"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                                style={{
                                  color: isOpen ? "#3D7FFF" : "rgba(61,127,255,0.5)",
                                  transform: isOpen ? "rotate(180deg)" : "none",
                                  transition: "transform 0.2s",
                                  flexShrink: 0,
                                }}>
                                <path d="M1.5 3.5l3 3 3-3" />
                              </svg>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-val-line">{it.user.email}</div>
                        </button>
                      </td>

                      <td className="px-4 py-3 font-mono text-sm text-val-cream">
                        {new Date(it.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                      </td>
                      <td className="px-4 py-3 font-display uppercase tracking-wider2 text-sm text-val-cream">
                        {it.type.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-val-cream">
                        {it.durationMin ? `${it.durationMin} min` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5"
                          style={{ color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}40` }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {it.proofUrl ? (
                          <a href={it.proofUrl} target="_blank"
                            className="font-display uppercase tracking-wider2 text-xs"
                            style={{ color: "#3D7FFF" }}>
                            Ver
                          </a>
                        ) : (
                          <span className="text-val-line text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(it.id)}
                          disabled={busy === it.id}
                          title="Excluir"
                          className="flex items-center justify-center w-7 h-7 rounded hover:bg-red-500/15 transition-colors"
                          style={{ color: busy === it.id ? "rgba(255,255,255,0.2)" : "rgba(255,70,85,0.65)" }}
                        >
                          <svg viewBox="0 0 16 18" width="13" height="15" fill="none"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 4h14M6 4V2h4v2M5 4v10a1 1 0 001 1h4a1 1 0 001-1V4" />
                            <line x1="7" y1="7" x2="7" y2="12" />
                            <line x1="9" y1="7" x2="9" y2="12" />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {/* Linha de observação expandida */}
                    {isOpen && hasNotes && (
                      <tr style={{ borderBottom: "1px solid rgba(61,127,255,0.08)" }}>
                        <td colSpan={7} className="px-4 pb-3 pt-0">
                          <div className="flex items-start gap-2 px-3 py-2 font-mono text-xs"
                            style={{
                              background: "rgba(61,127,255,0.05)",
                              border: "1px solid rgba(61,127,255,0.15)",
                              borderLeft: "3px solid rgba(61,127,255,0.55)",
                            }}>
                            <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                              style={{ color: "#3D7FFF", marginTop: 1, flexShrink: 0 }}>
                              <path d="M2 4h12M2 8h8M2 12h6" />
                            </svg>
                            <span style={{ color: "rgba(212,220,240,0.8)", lineHeight: 1.5 }}>
                              {it.notes}
                            </span>
                          </div>
                        </td>
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
            {visible.map((it) => {
              const st       = STATUS_STYLE[it.status] ?? { label: it.status, color: "#D4DCF0" };
              const isOpen   = openNotes === it.id;
              const hasNotes = !!it.notes?.trim();
              return (
                <div key={it.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    {/* Agente (clicável p/ notas) */}
                    <button
                      onClick={() => hasNotes && setOpenNotes(isOpen ? null : it.id)}
                      className="min-w-0 text-left"
                      style={{ cursor: hasNotes ? "pointer" : "default" }}
                    >
                      <div className="flex items-center gap-1 font-display uppercase tracking-wider2 text-xs break-words"
                        style={{ color: isOpen ? "#3D7FFF" : "#D4DCF0" }}>
                        {it.user.name}
                        {hasNotes && (
                          <svg viewBox="0 0 10 10" width="9" height="9" fill="none"
                            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                            style={{ color: isOpen ? "#3D7FFF" : "rgba(61,127,255,0.5)",
                              transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                            <path d="M1.5 3.5l3 3 3-3" />
                          </svg>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-val-line break-all">{it.user.email}</div>
                    </button>
                    {/* Status + excluir */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5"
                        style={{ color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}40` }}>
                        {st.label}
                      </span>
                      <button
                        onClick={() => handleDelete(it.id)}
                        disabled={busy === it.id}
                        title="Excluir"
                        className="flex items-center justify-center w-7 h-7 rounded hover:bg-red-500/15 transition-colors"
                        style={{ color: busy === it.id ? "rgba(255,255,255,0.2)" : "rgba(255,70,85,0.65)" }}
                      >
                        <svg viewBox="0 0 16 18" width="12" height="14" fill="none"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 4h14M6 4V2h4v2M5 4v10a1 1 0 001 1h4a1 1 0 001-1V4" />
                          <line x1="7" y1="7" x2="7" y2="12" /><line x1="9" y1="7" x2="9" y2="12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Linha de dados */}
                  <div className="font-mono text-[11px] text-rpg-textDim mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-val-cream">{new Date(it.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>
                    <span>·</span>
                    <span className="font-display uppercase tracking-wider2 text-val-cream">{it.type.replace("_", " ")}</span>
                    <span>·</span>
                    <span>{it.durationMin ? `${it.durationMin} min` : "—"}</span>
                    {it.proofUrl && (
                      <a href={it.proofUrl} target="_blank"
                        className="font-display uppercase tracking-wider2 text-xs ml-1"
                        style={{ color: "#3D7FFF" }}>
                        · Ver print
                      </a>
                    )}
                  </div>

                  {/* Observação expandida */}
                  {isOpen && hasNotes && (
                    <div className="flex items-start gap-2 px-3 py-2 font-mono text-xs mt-2"
                      style={{ background: "rgba(61,127,255,0.05)", border: "1px solid rgba(61,127,255,0.15)", borderLeft: "3px solid rgba(61,127,255,0.55)" }}>
                      <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                        style={{ color: "#3D7FFF", marginTop: 1, flexShrink: 0 }}>
                        <path d="M2 4h12M2 8h8M2 12h6" />
                      </svg>
                      <span style={{ color: "rgba(212,220,240,0.8)", lineHeight: 1.5 }}>{it.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
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
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <path d="M3 6l5 5 5-5" />
          </svg>
          {expanded ? "Mostrar menos" : `Mostrar mais (${filtered.length - PAGE_SIZE} restantes)`}
        </button>
      )}

    </div>
  );
}
