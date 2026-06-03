"use client";

import Link from "next/link";
import Image from "next/image";
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

      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/garcez-logo.png"
            alt="Garcez Consultoria Jurídica"
            width={150}
            height={45}
            priority
            className="object-contain"
            style={{
              filter:
                "brightness(1.1) sepia(0.15) hue-rotate(-5deg) saturate(1.1)",
            }}
          />
        </Link>

        {/* ── Navegação + Perfil ── */}
        <div className="flex items-center gap-0.5 min-w-0">
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {items.map((it) => {
              const isAnchor = it.href.includes("#");
              const active   = !isAnchor && (
                it.href === "/" ? pathname === "/" : pathname.startsWith(it.href)
              );

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

          {/* Perfil fora da nav para o dropdown não ser cortado */}
          {data && <ProfileMenu />}
        </div>
      </div>
    </header>
  );
}
