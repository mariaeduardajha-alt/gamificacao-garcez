# 03 — Padrões de código

> Consulta do dia a dia, para pessoas e para IA. Se for pedir código a uma LLM, entregue este arquivo como contexto.

## Princípio número 1: uma fonte única por assunto

Antes de escrever qualquer número, cor, rótulo ou cálculo, procure onde ele já existe:

| Preciso de... | Use |
|---|---|
| Regra do jogo (minutos, pontos, meta semanal, pesos, nome dos exercícios) | `lib/game-rules.ts` |
| Dias ativos, pontos, escudo, ranking | `lib/scoring.ts` (`activeDayKeys`, `computeActiveDaysStats`, `tierForValue`, `nextTierTarget`, `compareRank`, `rankWithTies`) |
| Dados do desafio/ranking numa página | `buildSnapshot()` em `lib/challenge.ts` |
| Cor/nome de escudo | `lib/tiers.ts` |
| Data na tela, data do formulário, iniciais | `lib/format.ts` (datas do jogo são salvas ao meio-dia UTC e formatadas em UTC) |
| Etiqueta de status | componente `StatusBadge` |
| Foto de pessoa | componente `Avatar` |
| Escudo | `MedalBadge` / `ShieldSvg` |
| Ícone de lixeira/seta | `components/icons.tsx` |
| Cabeçalho de seção / tabela | `SectionHeader`, `Th`/`Td` (`components/table/Table.tsx`) |
| Enviar dados para a API | hook `useApiMutation` (já traduz o erro para o usuário) |
| Fechar menu ao clicar fora | hook `useClickOutside` |

**Se precisar de algo novo, crie no lugar certo e reaproveite. Nunca copie.**

## Nomes

| O quê | Padrão | Exemplo |
|---|---|---|
| Página / rota de API | `page.tsx` / `route.ts` em pasta com o nome da URL | `app/meta-dos-setores/page.tsx`, `app/api/demands/route.ts` |
| Rota dinâmica / sub-ação | `[param]` / pasta extra | `api/demands/[id]/review/route.ts` |
| Componente | PascalCase, um principal por arquivo | `StatusBadge.tsx` |
| Módulo de `lib/` e hook | camelCase / `useAlgo` | `scoring.ts`, `useApiMutation.ts` |
| Tipo / interface | PascalCase, sem prefixo `I` | `PlayerStats` |
| Função | camelCase, começando por verbo | `computePlayerStats()` |
| Constante de módulo | UPPER_SNAKE_CASE | `WEIGHT_POINTS` |
| Booleano | `is` / `has` / `can` / `should` | `isTop3` |
| Model / campo Prisma | PascalCase singular / camelCase | `Activity.durationMin` |
| Valor de enum | UPPER_SNAKE_CASE | `ReviewStatus.APPROVED` |
| Rota de API | `/api/{recurso-no-plural-em-inglês}`, sem `/v1` | `/api/activities` |
| Variável de ambiente | UPPER_SNAKE_CASE (`NEXT_PUBLIC_` só se for para o navegador) | `NEXTAUTH_SECRET` |

## Rota de API — modelo

```ts
export const POST = withApiHandler(async (req: NextRequest) => {
  const authResult = await requireAuth();            // ou requireAdmin()
  if (!authResult.ok) return authResult.response;

  const parsed = algumSchema.safeParse(await req.json());   // schema em lib/schemas.ts
  if (!parsed.success) return apiError("invalid_input");

  // ... prisma, sempre filtrando pelo usuário da sessão quando o dado é pessoal
  return apiSuccess({ ok: true, id });
});
```

- Nunca devolva o registro de `User` inteiro: ele contém `passwordHash`.
- Upload: `isAllowedImage` + limite de tamanho + `saveUpload` (`lib/storage.ts`).
- Novo código de erro: acrescente em `api-response.ts` **e** a mensagem em `error-messages.ts`.

## Páginas e componentes

- Página é Server Component: `await requireSession()` (ou `requireAdminSession()`), dados via `buildSnapshot()`/Prisma, e passa para componentes cliente com `JSON.parse(JSON.stringify(...))`. Os tipos serializados estão em `types/domain.ts`.
- `"use client"` só onde houver estado ou clique.
- Estilo: classes do tema (`val-card`, `val-btn*`, `val-input`, `val-label`, `val-heading`, `clip-notch*`, `text-gradient`). Texto em degradê usa `backgroundImage` no `style`, nunca `background`.
- Não usamos: NestJS, Axios, React Query, Zustand, React Hook Form, shadcn/ui, Jest, Recharts.

## Testes

- **Unitários (Vitest)**, em `src/**/*.test.ts`: toda regra de pontuação nova ou alterada precisa de teste. `npm test`.
- **Ponta a ponta (Playwright)**, em `tests/e2e.mjs`: rodar antes de publicar mudanças em login, registro, admin ou HUB.

## Git

- Branch a partir da `main`: `feat/…`, `fix/…`, `refactor/…`, `chore/…`, `docs/…`.
- Commits no padrão Conventional Commits, com corpo em português: `fix: corrige cálculo de dias ativos`.
- Nunca commitar `.env`, `uploads/`, `tests/screenshots/`, `.claude/settings.local.json`.
- Antes do merge: `npm run build`, `npm test` e, se aplicável, `node tests/e2e.mjs`.

## Guia para uso de IA (Claude Code e similares)

Contexto para colar no pedido:

```
Projeto "Movimento em Jogo": Next.js 15 (App Router) + TypeScript, Prisma/PostgreSQL,
NextAuth v4, Tailwind. Front e API no mesmo repositório (route.ts em src/app/api).
Antes de codar, leia README.md e docs/03-padroes-de-codigo.md.
Regras: toda rota checa sessão (requireAuth/requireAdmin); dados pessoais filtrados
pelo userId da sessão; valide com zod (lib/schemas.ts); reaproveite as fontes únicas
de lib/ e components/; não use `any`; não invente model/campo — confira schema.prisma;
mudança de banco = migração (npm run db:migrate), nunca db push.
```

O que a IA costuma errar aqui:

| Erro comum | Faça assim |
|---|---|
| Recalcular dias ativos, pontos ou escudo dentro de um componente | Use `lib/scoring.ts` / `buildSnapshot()` |
| Escrever cores de escudo, "30 min", "10 pts" ou datas do desafio no código | Use `tiers.ts`, `game-rules.ts` e o `challenge` |
| Usar `as any` em `session.user` | Os tipos já estão em `types/next-auth.d.ts` |
| Chamar `fetch` direto no componente | `useApiMutation` |
| Usar `prisma db push` ou editar o banco à mão | `npm run db:migrate` (ver `04-banco-de-dados.md`) |
| `catch {}` que engole o erro | `withApiHandler` já registra o erro e responde de forma padronizada |
| Criar controller/service, Axios, React Query, Jest | Não fazem parte do projeto |

## Checklist de nova funcionalidade

1. Schema, se precisar → `npm run db:migrate -- --name descricao`.
2. Regras e cálculos em `lib/`, com teste unitário.
3. Rota de API seguindo o modelo acima.
4. Página (servidor) + componentes cliente só onde houver interação.
5. `npm run build`, `npm test` e `node tests/e2e.mjs` se o fluxo for coberto.
6. Atualizar o doc correspondente em `docs/` (regra nova vai em `02-regras-do-jogo.md`).
