import type { ActivityStatus } from "@prisma/client";

export function StatusBadge({ status }: { status: ActivityStatus }) {
  const map: Record<ActivityStatus, { label: string; cls: string }> = {
    PENDING: { label: "Pendente", cls: "bg-val-gold/20 text-val-gold border-val-gold/40" },
    APPROVED: { label: "Aprovada", cls: "bg-val-cyan/20 text-val-cyan border-val-cyan/40" },
    REJECTED: { label: "Rejeitada", cls: "bg-val-red/20 text-val-red border-val-red/40" }
  };
  const s = map[status];
  return (
    <span
      className={`inline-block px-2 py-1 border font-display uppercase tracking-wider2 text-[10px] ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
