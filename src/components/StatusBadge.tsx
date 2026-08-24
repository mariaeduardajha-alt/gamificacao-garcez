import type { ActivityStatus } from "@prisma/client";
import { STATUS_META } from "@/lib/status";

export function StatusBadge({ status }: { status: ActivityStatus }) {
  const s = STATUS_META[status];
  return (
    <span
      className={`inline-block px-2 py-1 border font-display uppercase tracking-wider2 text-[10px] ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
