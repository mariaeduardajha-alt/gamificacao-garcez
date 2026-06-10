"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ProfileMenu } from "./ProfileMenu";

const base = [
  { href: "/",                   label: "Movimento em Jogo" },
  { href: "/meta-dos-setores",    label: "Meta dos Setores"  },
  { href: "/registrar",          label: "Exercício"         },
  { href: "/demandas/nova",      label: "Demanda"           },
  { href: "/minhas",             label: "Histórico"         },
];

export function Navbar() {
  const { data } = useSession();
  const pathname  = usePathname();
  const role      = (data?.user as any)?.role;
  const items     = role === "ADMIN" ? [...base, { href: "/admin", label: "Admin" }] : base;
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu mobile ao trocar de rota
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    !href.includes("#") && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "rgba(6,9,26,0.92)",
        borderBottom: "1px solid rgba(61,127,255,0.15)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {/* Linha decorativa de topo */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(124,77,255,0.7), rgba(61,127,255,0.7), transparent)"
        }}
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/garcez-logo.png"
            alt="Garcez Consultoria Jurídica"
            width={150}
            height={45}
            priority
            className="object-contain w-[110px] sm:w-[150px] h-auto"
            style={{
              filter:
                "brightness(1.1) sepia(0.15) hue-rotate(-5deg) saturate(1.1)",
            }}
          />
        </Link>

        {/* ── Navegação desktop (escondida em mobile/tablet) ── */}
        <div className="hidden lg:flex items-center gap-0.5 min-w-0">
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {items.map((it) => {
              const active = isActive(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className="whitespace-nowrap px-3 py-2 font-display uppercase tracking-wider2 text-xs transition-colors relative"
                  style={{
                    color: active ? "#3D7FFF" : "rgba(212,220,240,0.75)",
                    textShadow: active ? "0 0 10px rgba(61,127,255,0.6)" : "none",
                  }}
                >
                  {it.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: "#3D7FFF", boxShadow: "0 0 6px #3D7FFF" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          {data && <ProfileMenu />}
        </div>

        {/* ── Ações mobile/tablet (perfil + hambúrguer) ── */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          {data && <ProfileMenu />}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="flex items-center justify-center w-9 h-9 rounded transition-colors"
            style={{
              border: `1px solid ${menuOpen ? "rgba(61,127,255,0.8)" : "rgba(61,127,255,0.3)"}`,
              background: menuOpen ? "rgba(61,127,255,0.15)" : "transparent",
              color: "#3D7FFF",
            }}
          >
            {menuOpen ? (
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Painel de navegação mobile/tablet ── */}
      {menuOpen && (
        <nav
          className="lg:hidden border-t"
          style={{
            borderColor: "rgba(61,127,255,0.15)",
            background: "rgba(8,12,28,0.98)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div className="px-3 py-2 flex flex-col">
            {items.map((it) => {
              const active = isActive(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className="px-3 py-3 font-display uppercase tracking-wider2 text-sm transition-colors flex items-center gap-2"
                  style={{
                    color: active ? "#3D7FFF" : "rgba(212,220,240,0.85)",
                    borderBottom: "1px solid rgba(61,127,255,0.08)",
                  }}
                >
                  {active && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "#3D7FFF", boxShadow: "0 0 6px #3D7FFF" }}
                    />
                  )}
                  {it.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
