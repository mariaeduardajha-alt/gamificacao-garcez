"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useClickOutside } from "@/hooks/useClickOutside";
import { TrashIcon } from "./icons";

/** Ações de uma atividade do próprio usuário: ver/baixar print e excluir. */
export function ActivityActions({
  id,
  proofUrl,
}: {
  id: string;
  proofUrl: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(useCallback(() => setOpen(false), []));
  const { mutate } = useApiMutation();

  async function handleDelete() {
    if (!confirm("Excluir este registro?")) return;
    setDeleting(true);
    try {
      await mutate(`/api/activities/${id}`, undefined, "DELETE");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao excluir registro");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">

      {/* Ver print */}
      {proofUrl ? (
        <a href={proofUrl} target="_blank" className="font-display uppercase tracking-wider2 text-xs" style={{ color: "#3D7FFF" }}>
          Ver
        </a>
      ) : (
        <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
      )}

      {/* Três pontos (download) */}
      {proofUrl && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors"
            title="Opções"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <svg viewBox="0 0 4 16" width="4" height="16" fill="currentColor">
              <circle cx="2" cy="2"  r="1.5" />
              <circle cx="2" cy="8"  r="1.5" />
              <circle cx="2" cy="14" r="1.5" />
            </svg>
          </button>

          {open && (
            <div
              className="absolute right-0 z-50 mt-1 py-1 min-w-[130px]"
              style={{
                background: "rgba(10,14,32,0.98)",
                border: "1px solid rgba(61,127,255,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <a
                href={proofUrl}
                download
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider2 hover:bg-white/5 transition-colors"
                style={{ color: "#D4DCF0" }}
              >
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v8M5 7l3 3 3-3" />
                  <path d="M2 12h12" />
                </svg>
                Download
              </a>
            </div>
          )}
        </div>
      )}

      {/* Lixeira */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Excluir registro"
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-500/15 transition-colors"
        style={{ color: deleting ? "rgba(255,255,255,0.2)" : "rgba(255,70,85,0.6)" }}
      >
        <TrashIcon />
      </button>

    </div>
  );
}
