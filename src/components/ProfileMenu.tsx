"use client";

import { useRef, useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export function ProfileMenu() {
  const { data, update } = useSession();
  const user       = data?.user as any;
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const menuRef    = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    const res  = await fetch("/api/profile", { method: "POST", body: fd });
    const data = await res.json();
    if (data.ok) {
      await update({ avatarUrl: data.avatarUrl });
    }
    setLoading(false);
    setOpen(false);
    e.target.value = "";
  }

  async function handleRemove() {
    if (!confirm("Remover foto de perfil?")) return;
    setLoading(true);
    await fetch("/api/profile", { method: "DELETE" });
    await update({ avatarUrl: null });
    setLoading(false);
    setOpen(false);
  }

  if (!user) return null;

  const initials = (user.name as string)
    .split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();

  return (
    <div className="relative ml-3 shrink-0" ref={menuRef}>
      {/* Avatar botão */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 focus:outline-none"
        title={user.name}
      >
        <div
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all"
          style={{
            border: open
              ? "2px solid rgba(61,127,255,0.9)"
              : "2px solid rgba(61,127,255,0.35)",
            boxShadow: open ? "0 0 10px rgba(61,127,255,0.4)" : "none",
            background: "rgba(13,19,48,0.8)",
          }}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 15%" }}
            />
          ) : (
            <span style={{
              fontFamily: "var(--font-display), Impact, sans-serif",
              fontSize: 13, fontWeight: 700, color: "#3D7FFF",
              letterSpacing: "0.05em",
            }}>
              {initials}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-12 z-50 py-2 min-w-[200px]"
          style={{
            background: "rgba(8,12,28,0.98)",
            border: "1px solid rgba(61,127,255,0.25)",
            backdropFilter: "blur(16px)",
            clipPath: "polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%)",
          }}
        >
          {/* Linha topo */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
            background:"linear-gradient(90deg,transparent,rgba(61,127,255,0.7),transparent)" }} />

          {/* Info do usuário */}
          <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(61,127,255,0.12)" }}>
            <div className="font-display uppercase tracking-wider2 text-val-cream text-xs">
              {user.name}
            </div>
            <div className="font-mono text-[10px] text-rpg-textDim mt-0.5">{user.email}</div>
          </div>

          {/* Editar foto */}
          <div className="px-2 pt-2 pb-1">
            <div className="font-mono text-[9px] uppercase tracking-wider2 px-2 mb-1"
              style={{ color: "rgba(212,220,240,0.35)" }}>
              Foto de perfil
            </div>

            {/* Alterar */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-wider2 text-val-cream"
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: "#3D7FFF" }}>
                <circle cx="8" cy="8" r="3" />
                <path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2" />
                <path d="M10 1l2 2-5 5H5V6l5-5z" />
              </svg>
              {loading ? "Aguarde..." : "Alterar foto"}
            </button>

            {/* Remover (só se tiver foto) */}
            {user.avatarUrl && (
              <button
                onClick={handleRemove}
                disabled={loading}
                className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-red-500/10 transition-colors font-mono text-xs uppercase tracking-wider2"
                style={{ color: "rgba(255,70,85,0.75)" }}
              >
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M5 8h6" />
                </svg>
                Remover foto
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="mx-3 my-1" style={{ height:1, background:"rgba(61,127,255,0.12)" }} />

          {/* Sair */}
          <div className="px-2 pb-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-red-500/10 transition-colors font-mono text-xs uppercase tracking-wider2"
              style={{ color: "rgba(255,70,85,0.75)" }}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l4-4-4-4M14 8H6" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Input de arquivo oculto */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
