import type { CSSProperties } from "react";
import { initials } from "@/lib/format";

/**
 * Foto do agente (ou iniciais, se não houver foto) — componente único usado
 * no ranking, pódio, menu de perfil, painel admin e metas dos setores.
 * Borda/sombra específicas de cada lugar vêm por `className`/`style`.
 */
export function Avatar({
  name,
  url,
  size,
  shape = "circle",
  initialsColor = "#D4DCF0",
  className = "",
  style,
}: {
  name: string;
  url?: string | null;
  size: number;
  shape?: "circle" | "notch";
  initialsColor?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden shrink-0 ${
        shape === "circle" ? "rounded-full" : "clip-notch-both"
      } ${className}`}
      style={{ width: size, height: size, background: "rgba(13,19,48,0.9)", ...style }}
    >
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" style={{ objectPosition: "center 15%" }} />
      ) : (
        <span
          className="font-display uppercase"
          style={{ fontSize: Math.round(size * 0.38), color: initialsColor, letterSpacing: "0.05em" }}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}
