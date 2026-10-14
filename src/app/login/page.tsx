"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { BrandFrame } from "@/components/BrandFrame";

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
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/garcez-logo-escuro.png"
            alt="Garcez Consultoria Jurídica"
            width={260}
            height={77}
            priority
            className="object-contain"
          />
        </div>

        <div className="text-center mb-8">
          <div className="font-serif italic font-semibold text-brand-title text-2xl">Pessoas e Cultura</div>
          <p className="font-brand font-bold text-brand-title text-xs uppercase tracking-[0.18em] mt-1">
            Acesso restrito · Equipe Garcez
          </p>
        </div>

        {/* Formulário */}
        <BrandFrame>
          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <div>
              <label className="brand-label">E-mail</label>
              <input
                type="email"
                className="brand-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="brand-label">Senha</label>
              <input
                type="password"
                className="brand-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {err && (
              <div className="px-3 py-2 font-brand text-sm rounded-sm border border-red-800/30 bg-red-800/5 text-red-800">
                {err}
              </div>
            )}

            <button type="submit" disabled={loading} className="brand-btn w-full mt-2">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </BrandFrame>

        <p className="text-center font-brand text-[11px] mt-5 text-brand-title">
          Garcez Consultoria Jurídica · {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
