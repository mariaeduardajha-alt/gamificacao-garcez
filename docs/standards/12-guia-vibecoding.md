# 12 — Guia de Vibecoding

> Como usar LLMs (Claude Code e afins) do jeito certo neste projeto. Se você só vai ler um arquivo desta pasta antes de pedir uma tarefa pra uma LLM, é este.

---

## 12.1 — Como este guia se relaciona com o `CLAUDE.md`

O projeto tem dois documentos com papéis diferentes:

- **`CLAUDE.md`** (raiz do repo) — manual **operacional**. Diz ao Claude Code como rodar o projeto do zero no Windows, quais credenciais usar, o que nunca fazer, como resolver os problemas comuns. É lido automaticamente pelo Claude Code no início de qualquer sessão neste repositório.
- **`docs/standards/`** (esta pasta) — guia de **padrões de código e arquitetura**. Não é lido automaticamente — passe o arquivo relevante (ou o [`99-referencia-completa.md`](./99-referencia-completa.md)) como contexto quando for pedir para a LLM criar ou alterar código.

Na prática: para "rodar o projeto", o Claude já sabe o que fazer via `CLAUDE.md`. Para "criar uma rota nova seguindo o padrão do projeto", cole o `04-rotas-de-api.md` (ou o `99`) no prompt.

---

## 12.2 — Regras de ouro do vibecoding

1. **Sempre passe documentação como contexto.** Peça para a LLM ler `docs/standards/99-referencia-completa.md` (ou o arquivo específico da área) antes de escrever código novo.
2. **Seja específico.** "Adiciona um campo de observação na rota de demandas, igual o `notes` de `activities`, opcional, string" é melhor que "adiciona um campo novo".
3. **Revise tudo antes de aceitar.** Principalmente: a rota nova verifica sessão? Verifica `role === "ADMIN"` quando deveria? O Prisma `where` filtra por `userId` do usuário logado (não deixa ver dado de outro usuário)?
4. **Corrija desvios imediatamente.** Se a LLM inventar um padrão que não existe no projeto (Controller/Service, Axios, React Query, `@@map` já aplicado), pare e corrija — não deixe acumular.
5. **Uma tarefa por vez.** Rotas + UI + schema numa tarefa só é receita para revisão difícil e regressão silenciosa.

---

## 12.3 — System prompt / contexto padrão (pronto para copiar)

```
Este é o projeto "Movimento em Jogo" (Garcez Consultoria) — um único
repositório Next.js 15 (App Router) + TypeScript fullstack, com Prisma +
PostgreSQL e NextAuth v4. NÃO existe backend separado, NÃO existe NestJS,
NÃO existe React Query/Zustand/RHF/Axios/shadcn — o frontend usa fetch
nativo e Server/Client Components puros, o "backend" são as rotas
route.ts em src/app/api/.

Antes de escrever qualquer código, leia docs/standards/99-referencia-completa.md
(ou o arquivo específico da área em docs/standards/) e siga os padrões
reais documentados lá, não padrões genéricos de outro stack.

Regras inegociáveis:
- Toda rota de API verifica sessão (auth()) antes de tocar no banco.
- Rotas administrativas verificam session.user.role === "ADMIN".
- Queries que retornam dado de usuário filtram por userId da sessão,
  nunca confiam em um id vindo do client sem checar dono/role.
- Não invente model Prisma, campo ou enum — confira prisma/schema.prisma.
- Não use `any` para contornar tipo — se o tipo do next-auth estiver
  incompleto, isso é um bug a reportar, não a mascarar.
```

---

## 12.4 — Receitas prontas (prompts copiáveis)

**Criar uma rota de API nova (CRUD simples):**
```
Cria a rota GET/POST /api/{recurso} seguindo exatamente o padrão de
src/app/api/demands/route.ts: verificar sessão com auth(), validar
o formData recebido contra um Set de valores válidos (ou o schema
Zod se um `src/lib/schemas.ts` já existir), criar via prisma.{model}.create,
e no GET filtrar por userId: session.user.id, orderBy pela data mais
relevante. Devolve NextResponse.json({ items }) no GET e
{ ok: true, id } no POST, igual o padrão existente.
```

**Adicionar campo novo no schema:**
```
Adiciona o campo {nome} ({tipo}, {obrigatório/opcional}) no model
{Model} em prisma/schema.prisma, seguindo a nomenclatura já usada
no arquivo (camelCase, sem @@map — ver docs/standards/03-nomenclatura-e-padroes.md
§3.5 antes de tocar nisso). Depois de editar o schema, rode
`npx prisma generate` e `npx prisma db push --skip-generate` (fluxo
atual do projeto — não use `migrate dev` a menos que o time já tenha
adotado o novo workflow, ver docs/standards/06-banco-de-dados.md).
```

**Criar tela de listagem:**
```
Cria a página src/app/{rota}/page.tsx como Server Component: busca os
dados direto via prisma (sem passar por fetch/API própria, é Server
Component), verifica auth() e redireciona pra /login se não houver
sessão, aplica o tema Tailwind existente (classes val-card, val-btn,
val-heading — ver tailwind.config.ts e src/app/globals.css antes de
inventar classe nova).
```

**Corrigir bug num cálculo de pontuação:**
```
O bug está relacionado a src/lib/scoring.ts (computeActiveDaysStats /
computePlayerStats / compareRank). Antes de mudar qualquer fórmula,
leia a seção "Sistema de pontuação" do CLAUDE.md e confira contra
docs/standards/99-referencia-completa.md — a regra de dias ativos e a
ordem de desempate são regra de negócio acordada, não just refatoração
livre.
```

**Extrair algo duplicado (ex.: mapeamento status→cor):**
```
O mapeamento status→label/cor está duplicado em StatusBadge.tsx,
MinhasTable.tsx e AllActivitiesHistory.tsx (com valores de cor que
não batem entre si). Cria src/lib/status.ts como fonte única
(STATUS_LABEL, STATUS_COLOR ou uma função getStatusMeta(status)) e
atualiza os 3 arquivos para importar dali, sem mudar o resultado
visual esperado — confirme com a pessoa qual conjunto de cores é o
"certo" antes de escolher, porque hoje eles divergem.
```

---

## 12.5 — Anti-patterns (o que a LLM tende a inventar errado aqui)

| O que a LLM tende a fazer | Por que está errado | O que fazer no lugar |
|---|---|---|
| Criar `products.controller.ts`/`.service.ts`/`.module.ts` | Não existe NestJS neste projeto | Rota de API é um `route.ts` só, com a lógica dentro ou em `lib/*.ts` |
| Importar `axios` ou `@tanstack/react-query` | Não estão instalados, e não são o padrão do projeto | `fetch` nativo; Server Components buscam via Prisma direto |
| Importar `zustand` para estado global | Não está instalado; estado é local (`useState`) ou vem de Server Component | `useState`/`useReducer` local, ou refazer a busca no server |
| Importar componentes de `shadcn/ui` | Não está instalado; o projeto tem design system Tailwind próprio | Usar classes `val-*`/`rpg-*` já definidas em `tailwind.config.ts` |
| Adicionar `@@map`/`@map` só no model que está sendo tocado | Cria inconsistência parcial — hoje NENHUM model tem `@map` | Deixar sem `@map` até a migração completa ser decidida e feita (ver 03 §3.5 e `06-banco-de-dados.md`) |
| Prefixar rota com `/api/v1/` | O projeto não versiona API | Usar `/api/{recurso}` direto, igual o resto |
| Rodar `prisma migrate dev` sem checar se o time já adotou esse fluxo | Hoje o padrão real é `db push`; migrar workflow é uma decisão documentada em `06-banco-de-dados.md`, não uma escolha ad-hoc da LLM | Usar `db push` a menos que a pessoa confirme que a migração de workflow já foi feita |
| Escrever `try { } catch { }` que engole o erro silenciosamente | Erro de Prisma sem log vira 500 sem rastro nenhum | Sempre `console.error` com contexto antes de responder erro genérico |
| Usar `as any` para "resolver" erro de tipo do `session.user` | Mascara um problema real — `next-auth.d.ts` não declara `avatarUrl` embora seja usado em runtime | Corrigir a declaração de tipo em `src/types/next-auth.d.ts`, não contornar com `any` |
| Reimplementar a lógica de medalha/tier em outro componente | Já existe 3x no projeto (`page.tsx`, `PodiumShield.tsx`, `MedalGauge.tsx`), com resultado nem sempre idêntico | Reusar `medalForTotal()` de `src/lib/scoring.ts` |
| Adicionar teste com Jest | O projeto não tem Jest configurado, só Playwright E2E | Se for propor testes unitários, sugerir Vitest explicitamente e configurar do zero — não assumir que já existe |

---

## 12.6 — Checklist de nova feature (ordem recomendada)

1. Model/campo no `prisma/schema.prisma` (se precisar) → `npx prisma generate` + `npx prisma db push --skip-generate`.
2. Rota(s) de API em `src/app/api/{recurso}/route.ts` — sessão, validação, Prisma, resposta.
3. Se a lógica for reaproveitável (cálculo, formatação), extrair para `src/lib/{nome}.ts`.
4. Página/componente em `src/app/{rota}/page.tsx` (Server Component busca dado) + componentes client (`"use client"`) só onde há interação.
5. Conferir contra `03-nomenclatura-e-padroes.md` antes de considerar pronto.
6. Rodar `npm run build` (pega erro de tipo) e, se a feature afeta um fluxo coberto por `tests/e2e.mjs`, rodar o teste E2E.
7. `git diff` arquivo por arquivo antes de commitar — não há CI configurado para pegar regressão automaticamente.

---

## 12.7 — Checklist pré-deploy

- `npm run build` passa sem erro.
- `node tests/e2e.mjs` passa com o dev server rodando.
- Nenhum `.env`/segredo novo commitado (`git status` limpo de `.env`).
- Se o schema Prisma mudou, o Dockerfile/fluxo de deploy consegue aplicar a mudança (ver `06-banco-de-dados.md` e `10-devops.md` — hoje isso passa por `prisma migrate diff --from-empty` rodado no build, não por uma migration incremental).
- `uploads/` continua fora do controle de versão (ver `09-git-workflow.md`).
