"use client";

import { usePathname } from "next/navigation";
import { isGameRoute } from "@/lib/sections";
import { Sidebar } from "./Sidebar";

/**
 * Moldura das páginas logadas: menu lateral institucional + conteúdo.
 * Páginas de gamificação ganham o fundo e as fontes de jogo. O login fica sem menu.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div className={`lg:pl-64 ${isGameRoute(pathname) ? "game-area font-sans" : ""}`}>{children}</div>
    </>
  );
}
