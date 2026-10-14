"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DemandWeight } from "@prisma/client";
import { useApiMutation } from "@/hooks/useApiMutation";
import { DEMAND_WEIGHTS, WEIGHT_POINTS, WEIGHT_COLOR, WEIGHT_LABEL } from "@/lib/game-rules";
import { todayInputValue } from "@/lib/format";

export default function NovaDemandaPage() {
  const router = useRouter();
  const { mutate, busy, error } = useApiMutation<FormData>();
  const [weight, setWeight] = useState<DemandWeight>("MEDIUM");
  const [preview, setPreview] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("weight", weight);
    try {
      await mutate("/api/demands", fd);
    } catch {
      return; // mensagem exibida via `error`
    }
    router.push("/demandas");
    router.refresh();
  }

  return (
    <>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="val-heading text-3xl">Registrar demanda</h1>
          <p className="font-mono text-val-line text-xs uppercase tracking-wider2 mt-1">
            Demanda concluída no ClickUp · sujeita a aprovação do admin
          </p>
        </div>

        <form onSubmit={onSubmit} className="val-card space-y-5">
          <div>
            <label className="val-label">Título da demanda</label>
            <input name="title" required className="val-input" placeholder="ex: Montagem de holding família X" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="val-label">Cliente <span className="text-val-line normal-case">opcional</span></label>
              <input name="client" className="val-input" placeholder="ex: Família Souza" />
            </div>
            <div>
              <label className="val-label">Concluída em</label>
              <input type="date" name="completedAt" required className="val-input" defaultValue={todayInputValue()} />
            </div>
          </div>

          <div>
            <label className="val-label">Peso da demanda</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DEMAND_WEIGHTS.map((w) => {
                const active = w === weight;
                return (
                  <button
                    type="button"
                    key={w}
                    onClick={() => setWeight(w)}
                    className={`p-3 border-2 transition-all text-left clip-notch ${
                      active ? "bg-val-bgDark" : "border-val-line/20 hover:border-val-line/50"
                    }`}
                    style={active ? { borderColor: WEIGHT_COLOR[w] } : {}}
                  >
                    <div className="font-display uppercase tracking-wider2 text-sm" style={{ color: WEIGHT_COLOR[w] }}>
                      {WEIGHT_LABEL[w]}
                    </div>
                    <div className="font-mono text-val-line text-xs mt-1">+{WEIGHT_POINTS[w]} pts</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="val-label">Observações <span className="text-val-line normal-case">opcional</span></label>
            <textarea name="notes" rows={2} className="val-input resize-none" placeholder="contexto extra" />
          </div>

          <div>
            <label className="val-label">Print do ClickUp <span className="text-val-line normal-case">opcional</span></label>
            <input
              type="file"
              name="proof"
              accept="image/*"
              className="val-input file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-val-red file:text-val-cream file:font-display file:uppercase file:tracking-wider2 file:text-xs file:cursor-pointer"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
            {preview && (
              <img src={preview} alt="preview" className="mt-3 max-h-64 border border-val-line/30 clip-notch" />
            )}
          </div>

          {error && (
            <div className="border border-val-red/50 bg-val-red/10 px-3 py-2 text-val-red font-mono text-xs uppercase">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => router.back()} className="val-btn-outline">Cancelar</button>
            <button type="submit" disabled={busy} className="val-btn-danger">
              {busy ? "Enviando..." : `Enviar (+${WEIGHT_POINTS[weight]} pts)`}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
