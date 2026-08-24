import type { ReactNode } from "react";

/**
 * Cabeçalho/célula de tabela compartilhados — mesmo estilo (font-display
 * uppercase tracking-wider2 pra `Th`, padding px-4 py-3 pra ambos) usado
 * antes de forma duplicada em `UsersManager.tsx`, `demandas/page.tsx` e
 * `MinhasTable.tsx`.
 */
export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line ${className ?? ""}`}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  // `align-top` vem da versão de `UsersManager.tsx` (linhas de edição têm
  // conteúdo de altura variável); é um no-op visual nas tabelas de linha
  // única (`demandas/page.tsx`, `MinhasTable.tsx`).
  return <td className={`px-4 py-3 text-sm align-top ${className ?? ""}`}>{children}</td>;
}
