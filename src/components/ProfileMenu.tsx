"use client";

import { useCallback, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Avatar } from "./Avatar";

/**
 * Foto do usuário no menu + opções: trocar/remover foto e sair.
 * `placement="up"` abre para cima (rodapé do menu lateral).
 */
export function ProfileMenu({ placement = "down" }: { placement?: "down" | "up" }) {
  const { data, update } = useSession();
  const user       = data?.user;
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const menuRef    = useClickOutside<HTMLDivElement>(useCallback(() => setOpen(false), []));
  const fileRef    = useRef<HTMLInputElement>(null);
  const { mutate } = useApiMutation();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const data = await mutate("/api/profile", fd, "POST");
      await update({ avatarUrl: data.avatarUrl });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao atualizar foto de perfil");
    } finally {
      setLoading(false);
      setOpen(false);
      e.target.value = "";
    }
  }

  async function handleRemove() {
    if (!confirm("Remover foto de perfil?")) return;
    setLoading(true);
    try {
      await mutate("/api/profile", undefined, "DELETE");
      await update({ avatarUrl: null });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao remover foto de perfil");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  if (!user) return null;

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Avatar botão */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 focus:outline-none"
        title={user.name}
      >
        <Avatar
          name={user.name}
          url={user.avatarUrl}
          size={36}
          initialsColor="rgb(var(--brand-title))"
          className="transition-all"
          style={{
            border: open ? "2px solid rgb(var(--brand-title))" : "2px solid rgb(var(--brand-line))",
            boxShadow: open ? "0 0 0 3px rgb(var(--brand-title) / 0.12)" : "none",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 py-2 min-w-[200px] rounded-md ${placement === "up" ? "left-0 bottom-12" : "right-0 top-12"}`}
          style={{
            background: "rgb(var(--brand-surface))",
            border: "1px solid rgb(var(--brand-line))",
            boxShadow: "0 10px 30px rgba(40,30,5,0.35)",
          }}
        >
          {/* Info do usuário */}
          <div className="px-4 py-3 border-b" style={{ borderColor: "rgb(var(--brand-line) / 0.5)" }}>
            <div className="font-serif font-semibold text-base text-brand-title">
              {user.name}
            </div>
            <div className="font-brand text-[11px] text-brand-ink mt-0.5">{user.email}</div>
          </div>

          {/* Editar foto */}
          <div className="px-2 pt-2 pb-1">
            <div className="font-brand text-[10px] uppercase tracking-[0.12em] px-2 mb-1 text-brand-ink">
              Foto de perfil
            </div>

            {/* Alterar */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-brand-title/5 transition-colors font-brand text-sm text-brand-title"
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: "rgb(var(--brand-title))" }}>
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
                className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-red-800/10 transition-colors font-brand text-sm"
                style={{ color: "#8B2E1E" }}
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
          <div className="mx-3 my-1" style={{ height:1, background:"rgb(var(--brand-line) / 0.5)" }} />

          {/* Sair */}
          <div className="px-2 pb-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-red-800/10 transition-colors font-brand text-sm"
              style={{ color: "#8B2E1E" }}
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
