"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setErr("Credenciais inválidas");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Glows de fundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(124,77,255,0.14), transparent 60%)," +
            "radial-gradient(ellipse at 70% 60%, rgba(61,127,255,0.10), transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-sm z-10">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/garcez-logo.png"
            alt="Garcez Consultoria Jurídica"
            width={220}
            height={66}
            priority
            className="object-contain"
            style={{ filter: "brightness(1.05)" }}
          />
        </div>

        {/* Subtitle */}
        <div className="text-center mb-6">
          <div
            className="font-display uppercase tracking-wider2 text-sm"
            style={{
              background: "linear-gradient(135deg, #A78BFA, #3D7FFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Movimento em Jogo
          </div>
          <p
            className="font-mono text-xs uppercase tracking-wider2 mt-1"
            style={{ color: "rgba(90,106,138,0.8)" }}
          >
            Acesso restrito · Equipe Garcez
          </p>
        </div>

        {/* Linha decorativa */}
        <div className="rpg-divider mb-6" />

        {/* Formulário */}
        <form
          onSubmit={onSubmit}
          className="space-y-4"
          style={{
            background: "rgba(10,14,32,0.90)",
            border: "1px solid rgba(61,127,255,0.20)",
            backdropFilter: "blur(16px)",
            padding: "1.75rem",
            clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)",
          }}
        >
          {/* Barra topo */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(124,77,255,0.7), rgba(61,127,255,0.7), transparent)"
            }}
          />

          <div>
            <label className="val-label">Email</label>
            <input
              type="email"
              className="val-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="val-label">Senha</label>
            <input
              type="password"
              className="val-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {err && (
            <div
              className="px-3 py-2 font-mono text-xs"
              style={{
                background: "rgba(255,70,85,0.10)",
                border: "1px solid rgba(255,70,85,0.40)",
                color: "#FF4655",
              }}
            >
              {err}
            </div>
          )}

          <button type="submit" disabled={loading} className="val-btn w-full mt-2">
            {loading ? "Entrando..." : "Entrar no Sistema"}
          </button>
        </form>

        <p
          className="text-center font-mono text-[10px] mt-4 uppercase tracking-wider2"
          style={{ color: "rgba(90,106,138,0.5)" }}
        >
          Garcez Consultoria Jurídica · 2026
        </p>
      </div>
    </main>
  );
}
