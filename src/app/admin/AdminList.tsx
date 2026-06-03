"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Item {
  id: string;
  date: string;
  type: string;
  durationMin: number | null;
  notes: string | null;
  proofUrl: string;
  user: { name: string; email: string };
}

export function AdminList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  async function review(id: string, action: "APPROVE" | "REJECT") {
    setBusy(id);
    const res = await fetch(`/api/activities/${id}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action })
    });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="val-card text-center py-16">
        <div className="font-display uppercase tracking-wider2 text-val-line">
          Fila limpa. Nenhuma atividade pendente.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div key={it.id} className="val-card grid md:grid-cols-[200px_1fr_auto] gap-6">
          <a href={it.proofUrl} target="_blank" className="block">
            <img
              src={it.proofUrl}
              alt="print"
              className="w-full h-48 object-cover border border-val-line/30 clip-notch hover:border-val-red transition-colors"
            />
          </a>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-display uppercase tracking-wider2 text-val-cream text-lg">
                {it.user.name}
              </span>
              <span className="font-mono text-val-line text-xs">{it.user.email}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Data" value={new Date(it.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} />
              <Field label="Tipo" value={it.type.replace("_", " ")} />
              <Field label="Duração" value={it.durationMin ? `${it.durationMin} min` : "—"} />
            </div>
            {it.notes && (
              <div className="text-sm text-val-line font-mono border-l-2 border-val-red/50 pl-3 mt-2">
                {it.notes}
              </div>
            )}
          </div>

          <div className="flex md:flex-col gap-2 items-center justify-center">
            <button
              onClick={() => review(it.id, "APPROVE")}
              disabled={busy === it.id}
              className="val-btn w-full"
            >
              Aprovar
            </button>
            <button
              onClick={() => review(it.id, "REJECT")}
              disabled={busy === it.id}
              className="val-btn-outline w-full"
            >
              Rejeitar
            </button>
          </div>
        </div>
      ))}
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
