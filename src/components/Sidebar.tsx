"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ProfileMenu } from "./ProfileMenu";
import { ChevronIcon } from "./icons";

/** `match`: prefixo de URL que também deixa o link ativo (ex.: /demandas/*). */
interface NavLink { href: string; label: string; match?: string }
interface NavGroup { label: string; icon: React.ReactNode; children: NavLink[] }
type NavEntry = (NavLink & { icon: React.ReactNode }) | NavGroup;

// Cores institucionais: variáveis --brand-* de globals.css
const ACTIVE    = "rgb(var(--brand-title))";
const TEXT      = "rgb(var(--brand-title))";
const TEXT_SOFT = "rgb(var(--brand-ink))";
const ACTIVE_BG = "rgb(var(--brand-surface) / 0.7)";
const LINE      = "rgb(var(--brand-line))";

/** Ícone de traço fino (viewBox 24), na linha das folhas do logo. */
function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const NAV: NavEntry[] = [
  { href: "/campanhas", label: "Campanhas",
    icon: <NavIcon d="M12 3.2c-2 0-3.4 1.6-3.4 3.5 0 2.3 1.7 4.8 3.4 7 1.7-2.2 3.4-4.7 3.4-7 0-1.9-1.4-3.5-3.4-3.5zM10 11.6 6.2 20.6l2.8-.8 1.6 2.3 3-6.8M14 11.6l3.8 9-2.8-.8-1.6 2.3-1.7-3.8" /> },
  { href: "/resgatando-os-bons-valores", label: "Resgatando os Bons Valores",
    icon: <NavIcon d="M12 21v-8.5M12 13C12 9.2 9.3 6.5 5.2 6.5c0 3.8 2.7 6.5 6.8 6.5zM12 10.5c0-3.3 2.4-5.8 6-5.8 0 3.3-2.4 5.8-6 5.8zM8 21h8" /> },
  { href: "/mural-dos-sonhos", label: "Mural dos Sonhos",
    icon: <NavIcon d="M18.5 15A7.5 7.5 0 0 1 9 5.5a7.5 7.5 0 1 0 9.5 9.5zM17 3.2l.55 1.45 1.45.55-1.45.55L17 7.2l-.55-1.45L15 5.2l1.45-.55z" /> },
  { label: "Jogos",
    icon: <NavIcon d="M8.5 20.5C5.2 18.4 3.6 15.2 4 11.5c.3-2.6 1.5-4.8 3.4-6.3M15.5 20.5c3.3-2.1 4.9-5.3 4.5-9-.3-2.6-1.5-4.8-3.4-6.3M4.4 14.6c1.6-.3 2.8.5 3.2 1.9-1.6.3-2.8-.5-3.2-1.9zM4.3 10.3c1.5.2 2.4 1.2 2.5 2.6-1.5-.2-2.4-1.2-2.5-2.6zM5.9 6.4c1.3.5 1.9 1.7 1.7 3-1.3-.5-1.9-1.7-1.7-3zM19.6 14.6c-1.6-.3-2.8.5-3.2 1.9 1.6.3 2.8-.5 3.2-1.9zM19.7 10.3c-1.5.2-2.4 1.2-2.5 2.6 1.5-.2 2.4-1.2 2.5-2.6zM18.1 6.4c-1.3.5-1.9 1.7-1.7 3 1.3-.5 1.9-1.7 1.7-3zM10.5 20.8h3" />,
    children: [
      { href: "/movimento-em-jogo", label: "Movimento em Jogo" },
      { href: "/registrar",         label: "Exercício" },
      { href: "/minhas",            label: "Histórico" },
    ] },
  { label: "Meta dos Setores",
    icon: <NavIcon d="M2.8 20.2 9.3 10l3.6 5.2 2.4-3.3 5.9 8.3zM9.3 10V3.8M9.3 4h4.3l-1 1.5 1 1.5H9.3" />,
    children: [
      { href: "/meta-dos-setores", label: "Painel dos Setores" },
      { href: "/demandas/nova",    label: "Demandas", match: "/demandas" },
    ] },
];

const ADMIN_ENTRY: NavEntry = {
  href: "/admin", label: "Admin",
  icon: <NavIcon d="M4.4 8a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0-7.2 0M10.6 10.6 20 20M15.6 15.6l2.2-2.2M18 18l1.8-1.8" />,
};

function isGroup(e: NavEntry): e is NavGroup {
  return "children" in e;
}

/** Menu lateral (desktop) e gaveta com o mesmo menu (celular/tablet). */
export function Sidebar() {
  const { data } = useSession();
  const pathname = usePathname();
  const entries  = data?.user.role === "ADMIN" ? [...NAV, ADMIN_ENTRY] : NAV;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (l: NavLink) => pathname.startsWith(l.match ?? l.href);

  // Grupos abertos: o grupo da página atual sempre abre
  const currentGroup = NAV.find((e) => isGroup(e) && e.children.some(isActive))?.label;
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(currentGroup ? [currentGroup] : [])
  );
  useEffect(() => {
    setDrawerOpen(false);
    if (currentGroup) setOpenGroups((prev) => new Set(prev).add(currentGroup));
  }, [pathname, currentGroup]);

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  const itemClass =
    "flex items-center gap-3 w-full px-3 py-2.5 rounded font-brand uppercase tracking-[0.12em] text-[11px] font-bold text-left transition-colors hover:bg-brand-surface/40";

  const navList = (
    <nav className="flex flex-col gap-1">
      {entries.map((entry) => {
        if (!isGroup(entry)) {
          const active = isActive(entry);
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={itemClass}
              style={{
                color: active ? ACTIVE : TEXT,
                background: active ? ACTIVE_BG : undefined,
              }}
            >
              {entry.icon}
              <span className="flex-1 leading-snug">{entry.label}</span>
            </Link>
          );
        }

        const open = openGroups.has(entry.label);
        const hasActive = entry.children.some(isActive);
        return (
          <div key={entry.label}>
            <button
              onClick={() => toggleGroup(entry.label)}
              className={itemClass}
              style={{ color: hasActive ? ACTIVE : TEXT }}
              aria-expanded={open}
            >
              {entry.icon}
              <span className="flex-1 leading-snug">{entry.label}</span>
              <ChevronIcon open={open} size={10} />
            </button>
            {open && (
              <div className="ml-[21px] pl-4 mt-0.5 mb-1 flex flex-col gap-0.5"
                style={{ borderLeft: `1px solid ${LINE}` }}>
                {entry.children.map((child) => {
                  const active = isActive(child);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="px-3 py-2 rounded font-brand text-[13px] transition-colors hover:bg-brand-surface/40"
                      style={{
                        color: active ? ACTIVE : TEXT_SOFT,
                        background: active ? ACTIVE_BG : undefined,
                        fontWeight: active ? 700 : 400,
                      }}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  const logo = (
    <Link href="/" className="flex items-center shrink-0">
      <Image
        src="/garcez-logo-escuro.png"
        alt="Garcez Consultoria Jurídica"
        width={150}
        height={45}
        priority
        className="object-contain w-[110px] lg:w-[150px] h-auto"
      />
    </Link>
  );

  const panelStyle: React.CSSProperties = {
    background: "rgb(var(--brand-bg))",
    borderRight: `1px solid ${LINE}`,
  };

  return (
    <>
      {/* ── Desktop: menu lateral fixo ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col" style={panelStyle}>
        <div className="px-5 pt-6 pb-5">{logo}</div>
        <div className="flex-1 overflow-y-auto px-3">{navList}</div>
        {data && (
          <div className="px-4 py-4 flex items-center gap-1" style={{ borderTop: `1px solid ${LINE}` }}>
            <ProfileMenu placement="up" />
            <div className="min-w-0 ml-1">
              <div className="font-serif font-semibold text-base leading-tight text-brand-title truncate">
                {data.user.name}
              </div>
              <div className="font-brand text-[11px] text-brand-title/80 truncate">{data.user.email}</div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Celular/tablet: barra do topo + gaveta ── */}
      <header
        className="lg:hidden sticky top-0 z-40 h-14 px-3 flex items-center justify-between gap-2"
        style={{ background: "rgb(var(--brand-bg) / 0.95)", borderBottom: `1px solid ${LINE}`, backdropFilter: "blur(12px)" }}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
          className="flex items-center justify-center w-9 h-9 rounded"
          style={{ border: `1px solid ${LINE}`, color: ACTIVE }}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>
        {logo}
        {data ? <ProfileMenu /> : <span className="w-9" />}
      </header>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col" style={panelStyle}>
            <div className="px-4 h-14 flex items-center justify-between">
              {logo}
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Fechar menu"
                className="flex items-center justify-center w-9 h-9 rounded"
                style={{ color: ACTIVE }}
              >
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2">{navList}</div>
          </aside>
        </div>
      )}
    </>
  );
}
