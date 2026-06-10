"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";

const types = [
  { value: "CAMINHADA",   label: "Caminhada"      },
  { value: "CORRIDA",     label: "Corrida"         },
  { value: "CICLISMO",    label: "Ciclismo"        },
  { value: "MUSCULACAO",  label: "Musculação"      },
  { value: "FUNCIONAL",   label: "Funcional"       },
  { value: "DANCA",       label: "Dança"           },
  { value: "NATACAO",     label: "Natação"         },
  { value: "ESPORTE",     label: "Esporte"         },
  { value: "TREINO_CASA", label: "Treino em casa"  },
  { value: "TRILHA",      label: "Trilha"          },
  { value: "OUTRA",       label: "Outra"           },
];

type Status = "idle" | "loading" | "success" | "rule_error" | "error";

export default function RegistrarPage() {
  const router   = useRouter();
  const [status,  setStatus]  = useState<Status>("idle");
  const [errMsg,  setErrMsg]  = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // força reset do form

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrMsg(null);

    const fd          = new FormData(e.currentTarget);
    const durationMin = Number(fd.get("durationMin") || 0);

    // Validação da regra dos 30 min
    if (durationMin < 30) {
      setStatus("rule_error");
      return;
    }

    setStatus("loading");
    const res = await fetch("/api/activities", { method: "POST", body: fd });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErrMsg(data?.error || "Erro ao enviar. Tente novamente.");
      setStatus("error");
      return;
    }

    // Salva dados para animação na tela principal
    const result = await res.json().catch(() => ({}));
    sessionStorage.setItem("justRegistered", JSON.stringify({
      durationMin,
      dayPointsGained: result.dayPointsGained ?? 10,
      bonusGained:     result.bonusGained     ?? 0,
      ts: Date.now(),
    }));

    setStatus("success");
    setPreview(null);

    // Mensagem some após 3s e form reseta para novo registro
    setTimeout(() => {
      setStatus("idle");
      setFormKey((k) => k + 1);
    }, 3000);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="val-heading text-2xl sm:text-3xl">Registrar atividade</h1>
          <p className="font-mono text-val-line text-xs uppercase tracking-wider2 mt-1">
            Registre seus dados · print opcional
          </p>
        </div>

        {/* ── Mensagem de sucesso ── */}
        {status === "success" && (
          <div
            className="relative overflow-hidden mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(6,30,20,0.97), rgba(10,40,28,0.97))",
              border: "1px solid rgba(45,212,191,0.55)",
              boxShadow: "0 0 32px rgba(45,212,191,0.18)",
              padding: "1.4rem 1.6rem",
              clipPath: "polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)",
            }}
          >
            <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
              background:"linear-gradient(90deg,transparent,#2DD4BF,transparent)" }} />
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 28 }}>✅</span>
              <div>
                <div className="font-display uppercase tracking-wider2 text-lg"
                  style={{ color: "#2DD4BF", textShadow: "0 0 12px rgba(45,212,191,0.6)" }}>
                  Exercício registrado!
                </div>
                <div className="font-mono text-xs uppercase tracking-wider2 mt-0.5"
                  style={{ color: "rgba(45,212,191,0.65)" }}>
                  Acesse a aba Movimento em Jogo para ver sua pontuação
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Mensagem de regra (< 30 min) ── */}
        {status === "rule_error" && (
          <div
            className="relative overflow-hidden mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(28,10,6,0.97), rgba(40,14,8,0.97))",
              border: "1px solid rgba(240,192,48,0.50)",
              boxShadow: "0 0 24px rgba(240,192,48,0.12)",
              padding: "1.4rem 1.6rem",
              clipPath: "polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)",
            }}
          >
            <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
              background:"linear-gradient(90deg,transparent,#F0C040,transparent)" }} />
            <div className="flex items-start gap-3">
              <span style={{ fontSize: 24, lineHeight:1, marginTop:2 }}>⚠️</span>
              <div>
                <div className="font-display uppercase tracking-wider2"
                  style={{ fontSize:13, color:"#F0C040", textShadow:"0 0 10px rgba(240,192,48,0.5)", marginBottom:4 }}>
                  Duração insuficiente para pontuar
                </div>
                <div className="font-mono text-xs leading-relaxed"
                  style={{ color:"rgba(212,220,240,0.75)" }}>
                  Para contar como <span style={{ color:"#F0C040", fontWeight:"bold" }}>dia ativo</span> e gerar pontuação,
                  a atividade deve ter no mínimo{" "}
                  <span style={{ color:"#2DD4BF", fontWeight:"bold" }}>30 minutos</span>.{" "}
                  Corrija a duração e tente novamente.
                </div>
              </div>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="mt-3 font-mono text-[10px] uppercase tracking-wider2 hover:underline"
              style={{ color:"rgba(240,192,48,0.6)" }}
            >
              Corrigir duração →
            </button>
          </div>
        )}

        {/* ── Erro genérico ── */}
        {status === "error" && errMsg && (
          <div className="mb-6 border border-val-red/50 bg-val-red/10 px-4 py-3 font-mono text-xs uppercase text-val-red">
            {errMsg}
          </div>
        )}

        {/* ── Formulário ── */}
        <form key={formKey} onSubmit={onSubmit} className="val-card space-y-5">

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="val-label">Data</label>
              <input
                type="date" name="date" required className="val-input"
                defaultValue={(() => {
                  const d = new Date();
                  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                })()}
                min="2026-06-08"
                max={(() => {
                  const d = new Date();
                  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                })()}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="val-label">Tipo</label>
              <select name="type" required className="val-input">
                {types.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="val-label">
              Duração (min)
              <span className="font-mono text-[10px] normal-case tracking-wider2 ml-2" style={{ color: "#A78BFA" }}>
                mínimo 30 min para contar como dia ativo
              </span>
            </label>
            <input
              type="number" name="durationMin" min={1} required
              className={`val-input ${status === "rule_error" ? "border-yellow-400/60" : ""}`}
              placeholder="ex: 45"
              onChange={() => { if (status === "rule_error") setStatus("idle"); }}
            />
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
            {preview && (
              <img src={preview} alt="preview"
                className="mt-3 max-h-64 border border-val-line/30 clip-notch" />
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
            <button type="button" onClick={() => router.back()} className="val-btn-outline w-full sm:w-auto">
              Cancelar
            </button>
            <button type="submit" disabled={status === "loading"} className="val-btn-danger w-full sm:w-auto">
              {status === "loading" ? "Enviando…" : "Confirmar Registro"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
