import type { ReviewStatus } from "@prisma/client";
import { STATUS_META } from "@/lib/status";

/** Etiqueta de status (Pendente / Aprovada / Rejeitada) — única em todo o app. */
export function StatusBadge({ status, className = "" }: { status: ReviewStatus; className?: string }) {
  const { label, color } = STATUS_META[status];
  return (
    <span
      className={`inline-block font-mono text-[10px] uppercase tracking-wider2 px-2 py-0.5 ${className}`}
      style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}
