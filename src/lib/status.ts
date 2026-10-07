import type { ReviewStatus } from "@prisma/client";

/**
 * Fonte única do mapeamento status → label/cor (serve para Activity e Demand,
 * que compartilham o enum `ReviewStatus`). Exibido pelo componente `StatusBadge`.
 * Cores = `val-gold` / `val-cyan` / `val-red` do `tailwind.config.ts`.
 */
export const STATUS_META: Record<ReviewStatus, { label: string; color: string }> = {
  PENDING:  { label: "Pendente",  color: "#F0C040" },
  APPROVED: { label: "Aprovada",  color: "#4AB8D4" },
  REJECTED: { label: "Rejeitada", color: "#FF4655" },
};
