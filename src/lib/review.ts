/**
 * Campos gravados quando o admin aprova/rejeita uma demanda
 * (a rota acrescenta os campos específicos, como weight/points).
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
