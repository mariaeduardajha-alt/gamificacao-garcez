/**
 * Campos comuns às decisões de revisão (aprovar/rejeitar) de Activity e Demand.
 * Não força um tipo genérico entre os dois modelos Prisma (schemas diferentes) —
 * cada rota faz o merge com seus próprios campos específicos (ex: kcal, weight/points).
 *
 * Nota: `note || null` (e não `note ?? null`) para preservar o comportamento original,
 * onde uma nota em branco ("") também vira `null`.
 */
export function reviewDecisionFields(
  action: "APPROVE" | "REJECT",
  reviewedBy: string,
  note?: string
) {
  return {
    status: action === "APPROVE" ? ("APPROVED" as const) : ("REJECTED" as const),
    reviewNote: note || null,
    reviewedBy,
    reviewedAt: new Date(),
  };
}
