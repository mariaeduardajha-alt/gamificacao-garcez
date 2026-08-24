# 03 — Nomenclatura e Padrões

> **Tom deste arquivo:** prescritivo, consulta diária. Se você não sabe como nomear algo, a resposta está aqui.

Cada regra vem com exemplo CERTO/ERRADO tirado (ou adaptado) do código real do projeto, e o "por quê".

---

## 3.1 — Arquivos e pastas

| Tipo de arquivo | Convenção | Exemplo real |
|---|---|---|
| Rota de API (App Router) | sempre `route.ts`, dentro de uma pasta com o nome do recurso | `src/app/api/activities/route.ts` |
| Rota de API dinâmica | pasta `[param]` | `src/app/api/activities/[id]/route.ts` |
| Sub-ação de uma rota | pasta extra dentro do recurso | `src/app/api/activities/[id]/review/route.ts` |
| Página (App Router) | sempre `page.tsx`, dentro de uma pasta com o nome da rota em kebab-case/português da URL | `src/app/meta-dos-setores/page.tsx` |
| Componente React | arquivo em **PascalCase**, um componente por arquivo, export com o mesmo nome do arquivo | `src/components/StatusBadge.tsx` exporta `StatusBadge` |
| Módulo utilitário / lib | arquivo em **camelCase** | `src/lib/scoring.ts`, `src/lib/challenge.ts`, `src/lib/storage.ts` |
| Middleware | sempre `middleware.ts` na raiz de `src/` (regra do Next.js, não é opcional) | `src/middleware.ts` |
| Tipos globais aumentando lib externa | `*.d.ts` | `src/types/next-auth.d.ts` |
| Config na raiz | nome exato exigido pela ferramenta | `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json` |

**Certo:**
```
src/lib/storage.ts
src/components/PlayerAvatar.tsx
src/app/api/demands/route.ts
```

**Errado:**
```
src/lib/Storage.ts          # lib não é PascalCase
src/components/player-avatar.tsx   # componente não é kebab-case
src/app/api/Demands/route.ts       # segmento de rota não é PascalCase
```

**Por quê:** o projeto não usa sufixos de framework backend (`.module.ts`, `.controller.ts`, `.service.ts`, `.guard.ts`, `.pipe.ts`, `.interceptor.ts`, `.filter.ts`, `.dto.ts`) porque **não existe NestJS aqui** — a estrutura de pastas do App Router (`page.tsx`, `route.ts`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) já é a convenção de nomes de arquivo especial do Next.js, imposta pelo próprio framework. Fora desses arquivos especiais, o padrão observado no projeto é:
- **Componentes** → PascalCase (`StatusBadge.tsx`, `MedalGauge.tsx`, `AdminList.tsx`).
- **Módulos em `lib/`** → camelCase (`scoring.ts`, `challenge.ts`, `prisma.ts`).

Hoje o projeto **não usa** hooks customizados nomeados `use-*.ts`, nem `.types.ts`/`.constants.ts`/`.utils.ts` separados — tipos e constantes vivem junto do módulo que os usa (ex.: `MedalTier`, `PlayerStats` e `RankCriteria` estão todos dentro de `src/lib/scoring.ts`). Se o projeto crescer e esses arquivos surgirem, siga camelCase com o sufixo descritivo (`domain.types.ts`, `file.constants.ts`).

---

## 3.2 — Classes, Interfaces, Types, Enums

- **PascalCase** para tipos, interfaces e classes. Sem prefixo `I` em interfaces.
- **UPPER_SNAKE_CASE** nos valores de enum do Prisma (é o padrão que o schema já usa).

**Certo (real, de `src/lib/scoring.ts` e `prisma/schema.prisma`):**
```ts
export interface PlayerStats { /* ... */ }
export interface RankCriteria { /* ... */ }
export type MedalTier = "NONE" | "BRONZE" | "SILVER" | "GOLD";
```
```prisma
enum ActivityType {
  CAMINHADA
  CORRIDA
  MUSCULACAO
  // ...
}
```

**Errado:**
```ts
export interface IPlayerStats { /* ... */ }   // sem prefixo I
export type medalTier = "none" | "bronze";    // type deve ser PascalCase, valores do domínio seguem o padrão do enum
```

---

## 3.3 — Variáveis, funções, métodos

- **camelCase** para variáveis e funções.
- **UPPER_SNAKE_CASE** para constantes de módulo.
- Funções começam com verbo.
- Prefixos booleanos: `is`, `has`, `can`, `should`.
- Handlers de evento React: prefixo `handle` (na definição) ou `on` (na prop).

**Certo (real):**
```ts
// src/lib/scoring.ts
export function computeActiveDaysStats(/* ... */) { /* ... */ }
export function medalForTotal(/* ... */) { /* ... */ }

export const WEIGHT_POINTS: Record<DemandWeight, number> = {
  SMALL: 5, MEDIUM: 15, LARGE: 30, EPIC: 50
};
```
```tsx
// src/app/admin/AdminList.tsx
async function review(id: string, action: "APPROVE" | "REJECT") { /* ... */ }
// uso: onClick={() => review(it.id, "APPROVE")}
```

**Errado:**
```ts
function ComputeActiveDaysStats() {}   // função não é PascalCase
const weight_points = {};              // constante de módulo deve ser UPPER_SNAKE_CASE
```

---

## 3.4 — Componentes React

- Arquivo em PascalCase, um componente principal por arquivo (componentes auxiliares pequenos podem viver no mesmo arquivo — ex. `Field` dentro de `AdminList.tsx` — desde que não sejam reutilizados em outro lugar).
- Props tipadas inline ou com interface `{Nome}Props` quando o componente cresce.
- Componentes `"use client"` declaram a diretiva na primeira linha do arquivo.

**Certo (real, `src/components/StatusBadge.tsx`):**
```tsx
import type { ActivityStatus } from "@prisma/client";

export function StatusBadge({ status }: { status: ActivityStatus }) {
  const map: Record<ActivityStatus, { label: string; cls: string }> = {
    PENDING:  { label: "Pendente", cls: "bg-val-gold/20 text-val-gold border-val-gold/40" },
    APPROVED: { label: "Aprovada", cls: "bg-val-cyan/20 text-val-cyan border-val-cyan/40" },
    REJECTED: { label: "Rejeitada", cls: "bg-val-red/20 text-val-red border-val-red/40" }
  };
  const s = map[status];
  return <span className={/* ... */}>{s.label}</span>;
}
```

**Atenção — problema real conhecido:** o mapeamento status→cor/label acima está **duplicado** em pelo menos 3 lugares do projeto (`StatusBadge.tsx`, `MinhasTable.tsx`, `AllActivitiesHistory.tsx`), com cores que nem sempre batem entre si. Ao tocar em qualquer um desses arquivos, prefira extrair para uma fonte única (`src/lib/status.ts`) em vez de copiar mais uma vez — ver recomendação em [`12-guia-vibecoding.md`](./12-guia-vibecoding.md).

---

## 3.5 — Banco de dados / Prisma Schema

> **Estado atual vs. padrão adotado — leia com atenção, isto NÃO está implementado ainda.**

**Hoje**, o banco usa a nomenclatura **padrão do Prisma**, sem `@@map`/`@map`: os nomes das tabelas e colunas no PostgreSQL são exatamente os nomes dos models e campos do `schema.prisma` (PascalCase para tabelas — `User`, `Activity`, `SectorGoal` — e camelCase para colunas — `userId`, `durationMin`, `avatarUrl`). Isso é visível em qualquer `psql \d` rodado contra o banco de produção.

```prisma
// prisma/schema.prisma — como está HOJE, sem @@map
model Activity {
  id          String         @id @default(cuid())
  userId      String
  durationMin Int?
  proofUrl    String?
  // ...
}
```

**O padrão adotado daqui pra frente** (decisão do time) é usar `@@map`/`@map` para expor os nomes em `snake_case` no banco, mantendo PascalCase/camelCase no schema Prisma e no TypeScript gerado — é o padrão mais comum em times PostgreSQL e evita nomes com aspas em queries SQL cruas:

```prisma
// alvo — ainda NÃO aplicado no banco real
model Activity {
  id          String         @id @default(cuid())
  userId      String         @map("user_id")
  durationMin Int?           @map("duration_min")
  proofUrl    String?        @map("proof_url")

  @@map("activities")
}
```

**Isso ainda não foi migrado.** Existe uma migração pendente (tarefa de implementação futura, fora do escopo desta documentação) para aplicar `@@map`/`@map` retroativamente a todos os models sem quebrar o banco em produção. Até essa migração ser feita e este parágrafo ser atualizado:

- **Não** adicione `@@map`/`@map` em models novos isoladamente — isso criaria inconsistência (alguns models mapeados, outros não) sem resolver o problema de verdade.
- Trate o schema atual (sem `@map`) como válido e funcional para qualquer trabalho no dia a dia.
- Veja [`06-banco-de-dados.md`](./06-banco-de-dados.md) para o detalhamento completo da estratégia de migração, incluindo a Decisão B (fluxo de migrations).

Regras que **já valem hoje**, independente do `@@map`:
- Models em **PascalCase singular** (`User`, `Activity`, `Demand`, `Challenge`, `SectorGoal` — nunca `Users` ou `activity`).
- Campos em **camelCase** (`userId`, `durationMin`, `proofUrl`, `reviewedAt`).
- Enums em **PascalCase**, valores em **UPPER_SNAKE_CASE** (`ActivityStatus.PENDING`, `DemandWeight.EPIC`).
- Índices explícitos via `@@index([...])` em colunas usadas em filtros frequentes — ex. `@@index([userId, date])` em `Activity`, porque toda listagem "minhas atividades" filtra por `userId` e ordena por `date`.

---

## 3.6 — Rotas de API

- **Sem prefixo `/api/v1`.** O projeto usa `/api/{recurso}` direto (`/api/activities`, `/api/demands`, `/api/users`). Não há versionamento de API hoje — se um dia for necessário, será uma decisão nova, não o padrão atual.
- Recursos no **plural**, em inglês (`activities`, `demands`, `users`), mesmo que a UI em português use outro termo (a página é `/registrar`, a API por trás é `/api/activities`).
- Ações que não são CRUD puro viram sub-rota: `/api/activities/[id]/review`, não um query param `?action=review`.
- Query params, quando existirem, em camelCase.

**Certo (real):**
```
GET    /api/activities
POST   /api/activities
DELETE /api/activities
POST   /api/activities/[id]/review
GET    /api/users
POST   /api/users
GET    /api/uploads/[...path]        (servida por src/app/uploads/[...path]/route.ts)
```

---

## 3.7 — Git: branches, commits, tags

O histórico real do projeto usa mensagens de commit descritivas em português, sem seguir Conventional Commits estritamente. **Adotamos Conventional Commits como padrão daqui pra frente** (ver [`09-git-workflow.md`](./09-git-workflow.md) para o detalhamento completo) — isso não exige reescrever o histórico existente, só passa a valer para commits novos:

```
feat: adiciona filtro por setor na fila de aprovação admin
fix: corrige cálculo de dias ativos quando duração é null
chore: atualiza dependências do Prisma
docs: documenta fluxo de upload em docs/standards/08-api.md
```

Branches: `tipo/descricao-curta-kebab` (`feat/filtro-setor`, `fix/dias-ativos-null`).

---

## 3.8 — Variáveis de ambiente

UPPER_SNAKE_CASE, sem prefixo por serviço (o projeto é um repo único, não há múltiplos serviços para diferenciar). As variáveis reais, do `.env.example`:

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
UPLOADS_DIR
SEED_PASSWORD
```

Next.js expõe variáveis ao client só com o prefixo `NEXT_PUBLIC_` — o projeto hoje **não tem nenhuma** variável client-side, todas as acima são server-only. Se precisar expor algo ao browser no futuro, use esse prefixo.

---

## 3.9 — Cheat sheet

| O quê | Padrão | Exemplo |
|---|---|---|
| Rota de API | `route.ts` dentro de pasta do recurso | `api/activities/route.ts` |
| Página | `page.tsx` | `app/demandas/page.tsx` |
| Componente | PascalCase, 1 por arquivo | `StatusBadge.tsx` |
| Módulo `lib/` | camelCase | `scoring.ts` |
| Interface/Type | PascalCase, sem prefixo `I` | `PlayerStats` |
| Enum (valor) | UPPER_SNAKE_CASE | `ActivityStatus.APPROVED` |
| Função | camelCase, começa com verbo | `computePlayerStats()` |
| Constante de módulo | UPPER_SNAKE_CASE | `WEIGHT_POINTS` |
| Booleano | prefixo is/has/can/should | `isAdmin` |
| Model Prisma | PascalCase singular | `Activity` |
| Campo Prisma | camelCase (hoje); `@map` snake_case é o alvo, ainda não migrado | `durationMin` |
| Rota de API | `/api/{recurso-plural}`, sem `/v1` | `/api/demands` |
| Branch git | `tipo/descricao-kebab` | `fix/dias-ativos-null` |
| Commit | Conventional Commits | `feat: ...` |
| Env var | UPPER_SNAKE_CASE | `NEXTAUTH_SECRET` |
