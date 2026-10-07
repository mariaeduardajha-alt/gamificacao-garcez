"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActivityType } from "@prisma/client";
import { useApiMutation } from "@/hooks/useApiMutation";
import { ACTIVITY_TYPE_LABEL, MIN_MINUTES_PER_ACTIVE_DAY } from "@/lib/game-rules";
import { todayInputValue } from "@/lib/format";

type Result = { dayPointsGained: number; bonusGained: number; dayMinutes: number };

/** Formulário de registro de exercício (o exercício já entra aprovado). */
export function ActivityForm({ minDate }: { minDate: string }) {
  const router = useRouter();
  const { mutate, busy, error } = useApiMutation<FormData>();
  const [result,  setResult]  = useState<Result | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // força reset do form
  const today = todayInputValue();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    let data: Result;
    try {
      data = await mutate("/api/activities", new FormData(e.currentTarget));
    } catch {
      return; // mensagem exibida via `error`
    }

    // Dados para a animação de pontos na tela principal
    sessionStorage.setItem("justRegistered", JSON.stringify({
      dayPointsGained: data.dayPointsGained,
      bonusGained:     data.bonusGained,
      ts: Date.now(),
    }));

    setResult(data);
    setPreview(null);
    setFormKey((k) => k + 1);
  }

  const missingMinutes = result ? Math.max(0, MIN_MINUTES_PER_ACTIVE_DAY - result.dayMinutes) : 0;

  return (
    <>
      {/* ── Registrado e o dia já conta como ativo ── */}
      {result && missingMinutes === 0 && (
        <Notice color="#2DD4BF" icon="✅" title="Exercício registrado!">
          Acesse a aba Movimento em Jogo para ver sua pontuação
        </Notice>
      )}

      {/* ── Registrado, mas o dia ainda não completou o mínimo ── */}
      {result && missingMinutes > 0 && (
        <Notice color="#F0C040" icon="⏱️" title="Exercício registrado — dia ainda não pontua">
          Para o dia contar como <b style={{ color: "#F0C040" }}>dia ativo</b>, registre mais{" "}
          <b style={{ color: "#2DD4BF" }}>{missingMinutes} min</b> nesta data
          (mínimo de {MIN_MINUTES_PER_ACTIVE_DAY} min somados no dia).
        </Notice>
      )}

      {error && (
        <div className="mb-6 border border-val-red/50 bg-val-red/10 px-4 py-3 font-mono text-xs uppercase text-val-red">
          {error}
        </div>
      )}

      <form key={formKey} onSubmit={onSubmit} className="val-card space-y-5">

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="val-label">Data</label>
            <input
              type="date" name="date" required className="val-input"
              defaultValue={today} min={minDate} max={today}
              style={{ colorScheme: "dark" }}
            />
          </div>
          <div>
            <label className="val-label">Tipo</label>
            <select name="type" required className="val-input">
              {(Object.entries(ACTIVITY_TYPE_LABEL) as [ActivityType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="val-label">
            Duração (min)
            <span className="font-mono text-[10px] normal-case tracking-wider2 ml-2" style={{ color: "#A78BFA" }}>
              o dia conta como ativo com {MIN_MINUTES_PER_ACTIVE_DAY} min somados
            </span>
          </label>
          <input type="number" name="durationMin" min={1} required className="val-input" placeholder="ex: 45" />
        </div>

        <div>
          <label className="val-label">Observações <span className="text-val-line normal-case">opcional</span></label>
          <textarea name="notes" rows={2} className="val-input resize-none" placeholder="algo a destacar" />
        </div>

        <div>
          <label className="val-label">
            Print da atividade
            <span className="font-mono text-[10px] normal-case tracking-wider2 ml-2 text-val-line">opcional</span>
          </label>
          <input
            type="file" name="proof" accept="image/*"
            className="val-input file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-val-red file:text-val-cream file:font-display file:uppercase file:tracking-wider2 file:text-xs file:cursor-pointer"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
          {preview && <img src={preview} alt="preview" className="mt-3 max-h-64 border border-val-line/30 clip-notch" />}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
          <button type="button" onClick={() => router.back()} className="val-btn-outline w-full sm:w-auto">
            Cancelar
          </button>
          <button type="submit" disabled={busy} className="val-btn-danger w-full sm:w-auto">
            {busy ? "Enviando…" : "Confirmar Registro"}
          </button>
        </div>
      </form>
    </>
  );
}

/** Caixa de aviso após o envio. */
function Notice({ color, icon, title, children }: { color: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden mb-6 clip-notch-sm"
      style={{
        background: "rgba(8,14,30,0.97)",
        border: `1px solid ${color}8C`,
        boxShadow: `0 0 32px ${color}2E`,
        padding: "1.4rem 1.6rem",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <div className="flex items-start gap-3">
        <span style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>
        <div>
          <div className="font-display uppercase tracking-wider2 text-lg" style={{ color, textShadow: `0 0 12px ${color}99` }}>
            {title}
          </div>
          <div className="font-mono text-xs mt-1 leading-relaxed" style={{ color: "rgba(212,220,240,0.75)" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
