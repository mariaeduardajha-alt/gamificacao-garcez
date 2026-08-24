import type { ActivityStatus } from "@prisma/client";

/**
 * Fonte única do mapeamento status → label/cor.
 * `DemandStatus` no schema tem os mesmos 3 valores (PENDING/APPROVED/REJECTED)
 * de `ActivityStatus`, então este mapa serve pros dois.
 *
 * Cores canônicas: as de `StatusBadge.tsx` (versão anterior), resolvidas a
 * partir das cores `val-gold`/`val-cyan`/`val-red` do `tailwind.config.ts`.
 * As outras duas cópias (`MinhasTable.tsx`, `AllActivitiesHistory.tsx`)
 * usavam hexs soltos que nem batiam entre si (ex: "aprovada" usava
 * `#2DD4BF`, que na verdade é a cor `rpg-teal`, não `val-cyan`).
 */
export const STATUS_META: Record<ActivityStatus, { label: string; color: string; cls: string }> = {
  PENDING: {
    label: "Pendente",
    color: "#F0C040", // val-gold
    cls: "bg-val-gold/20 text-val-gold border-val-gold/40",
  },
  APPROVED: {
    label: "Aprovada",
    color: "#4AB8D4", // val-cyan
    cls: "bg-val-cyan/20 text-val-cyan border-val-cyan/40",
  },
  REJECTED: {
    label: "Rejeitada",
    color: "#FF4655", // val-red
    cls: "bg-val-red/20 text-val-red border-val-red/40",
  },
};
