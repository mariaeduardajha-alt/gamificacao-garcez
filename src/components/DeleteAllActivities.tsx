"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAllActivities({ count }: { count: number }) {
  const router  = useRouter();
  const [busy,   setBusy]   = useState(false);
  const [confirm, setConfirm] = useState(false);

  if (count === 0) return null;

  async function handleDeleteAll() {
    setBusy(true);
    await fetch("/api/activities", { method: "DELETE" });
    setBusy(false);
    setConfirm(false);
    router.refresh();
  }

  return (
    <>
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider2 px-3 py-2 transition-colors hover:bg-red-500/10"
          style={{
            color: "rgba(255,70,85,0.65)",
            border: "1px solid rgba(255,70,85,0.25)",
          }}
        >
          <svg viewBox="0 0 16 18" width="11" height="13" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4h14M6 4V2h4v2M5 4v10a1 1 0 001 1h4a1 1 0 001-1V4" />
            <line x1="7" y1="7" x2="7" y2="12" /><line x1="9" y1="7" x2="9" y2="12" />
          </svg>
          Excluir todas
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider2"
            style={{ color: "rgba(255,70,85,0.8)" }}>
            Excluir {count} registro{count !== 1 ? "s" : ""}?
          </span>
          <button
            onClick={handleDeleteAll}
            disabled={busy}
            className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-1 transition-colors"
            style={{
              background: "rgba(255,70,85,0.15)",
              border: "1px solid rgba(255,70,85,0.45)",
              color: "#FF4655",
            }}
          >
            {busy ? "…" : "Confirmar"}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="font-mono text-[10px] uppercase tracking-wider2 px-2 py-1 transition-colors hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(212,220,240,0.5)" }}
          >
            Cancelar
          </button>
        </div>
      )}
    </>
  );
}
