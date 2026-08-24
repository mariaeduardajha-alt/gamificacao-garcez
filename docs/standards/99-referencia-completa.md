# 99 — Referência Completa (para LLMs)

> Este arquivo consolida os 13 arquivos anteriores de `docs/standards/` num único documento, otimizado para ser passado como contexto a uma LLM. Conteúdo direto, sem tom didático/pedagógico. Para explicações mais longas e exemplos completos, ver os arquivos individuais linkados no `00-indice.md`. Este é o único arquivo que copia trechos do `CLAUDE.md` diretamente (em vez de só referenciar) — é deliberado, para autossuficiência de contexto.

---

## Papel, projeto, regras invioláveis

Você está trabalhando no **Movimento em Jogo** ("Projeto POT"), plataforma de gamificação da equipe **Garcez Consultoria**. É **um único repositório Next.js 15 (App Router) fullstack** em TypeScript — não existe backend separado, não existe NestJS, não existe React Query/Zustand/RHF/Axios/shadcn/ui/Jest. Ambiente de desenvolvimento é **Windows + PowerShell**.

**Regras invioláveis:**
1. Toda rota de API protegida verifica `const session = await auth(); if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });` antes de tocar no banco.
2. Rotas administrativas verificam `session.user.role !== "ADMIN"` → `403 forbidden`.
3. Toda query que devolve dado de usuário filtra por `userId: session.user.id` — nunca confia em um `id` vindo do client sem checar dono ou role.
4. Nunca invente model, campo ou enum do Prisma — confira `prisma/schema.prisma` antes de usar.
5. Nunca use `@@map`/`@map` isoladamente num model só porque está sendo tocado — é uma decisão de migração completa, ainda pendente (ver seção Banco de Dados abaixo).
6. Nunca rode `prisma migrate dev` sem confirmar que a baseline de migration já foi criada (ver seção Banco de Dados) — hoje o comando real é `prisma db push`.
7. Nunca use `as any` para contornar erro de tipo do `session.user` — se faltar campo em `next-auth.d.ts`, declare o campo corretamente.
8. Nunca peça para o usuário rodar comando nenhum (`npm install`, `prisma ...`, `psql ...`) — execute você mesmo, via PowerShell.
9. Não suba em produção sem pedido explícito. Não apague o banco sem confirmação. Não commite `.env`. Não altere `NEXTAUTH_SECRET`.
10. Não use comandos macOS (`brew`, `nohup`, `which`, `/tmp/`) — o ambiente é Windows.

---

## Stack real

| Tecnologia | Papel |
|---|---|
| Next.js 15 (App Router) + TypeScript | frontend e "backend" (rotas de API), mesmo processo |
| Prisma + PostgreSQL | ORM + banco, local nativo em dev |
| NextAuth v4 | sessão JWT via cookie, provider de credenciais |
| Tailwind CSS | tema customizado tático/"Valorant" (`tailwind.config.ts`, `globals.css`) |
| Recharts | gauges/gráficos |
| Playwright | único teste automatizado (`tests/e2e.mjs`, E2E) — zero testes unitários hoje |
| bcryptjs | hash de senha |
| Docker (multi-stage) + Coolify | build e deploy de produção |

---

## Rotas principais (páginas)

| Rota | Quem acessa | Função |
|---|---|---|
| `/login` | público | Auth |
| `/` | qualquer logado | HUB: meta coletiva + pódio + ranking geral |
| `/registrar` | qualquer logado | Form atividade física + upload do print |
| `/minhas` | qualquer logado | Histórico de atividades |
| `/demandas` | qualquer logado | Histórico de demandas de trabalho |
| `/demandas/nova` | qualquer logado | Form de nova demanda |
| `/meta-dos-setores` | qualquer logado | Metas por área (SectorGoal) |
| `/admin` | ADMIN | Fila de validação (atividades + demandas) + engajamento |
| `/admin/usuarios` | ADMIN | CRUD de agentes |

## Rotas de API

| Rota | Método | Quem acessa | Função |
|---|---|---|---|
| `/api/activities` | GET/POST/DELETE | logado | lista/cria/apaga (todas) atividades do próprio usuário |
| `/api/activities/[id]/review` | POST | ADMIN | aprova/rejeita atividade |
| `/api/demands` | GET/POST | logado | lista/cria demandas do próprio usuário |
| `/api/demands/[id]/review` | POST | ADMIN | aprova/rejeita demanda |
| `/api/users` | GET/POST | ADMIN | lista/cria agentes |
| `/api/users/[id]` | PATCH/DELETE | ADMIN | edita/remove agente |
| `/api/profile` | POST/DELETE | logado | atualiza/remove avatar próprio |
| `/api/auth/[...nextauth]` | GET/POST | público | login/logout (NextAuth) |
| `/uploads/[...path]` | GET | logado | serve arquivo de comprovante/avatar |

Sem prefixo `/api/v1`. Sem paginação. Resposta de sucesso varia por rota (`{ items }`, `{ ok: true, id }`, `{ users }`); erro por convenção `{ error: "codigo_snake" }` com status HTTP correspondente (401/403/400/404/409) — não garantido estruturalmente (zero `try/catch` nas rotas hoje).

---

## Modelos Prisma

```prisma
enum Role { USER  ADMIN }
enum ActivityStatus { PENDING  APPROVED  REJECTED }
enum DemandStatus { PENDING  APPROVED  REJECTED }
enum ActivityType { CAMINHADA CORRIDA CICLISMO MUSCULACAO FUNCIONAL DANCA NATACAO ESPORTE TREINO_CASA TRILHA OUTRA }
enum DemandWeight { SMALL /*5pts*/ MEDIUM /*15pts*/ LARGE /*30pts*/ EPIC /*50pts*/ }
enum GoalDirection { HIGHER_IS_BETTER  LOWER_IS_BETTER }

model User {
  id String @id @default(cuid())
  email String @unique
  name String
  passwordHash String
  role Role @default(USER)
  avatarUrl String?
  sector String?
  createdAt DateTime @default(now())
  activities Activity[]
  demands Demand[]
}

model Activity {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  date DateTime
  type ActivityType
  kcal Int              // legado, fixado em 0 na criação
  durationMin Int?
  notes String?
  proofUrl String?
  status ActivityStatus @default(PENDING)
  reviewedBy String?
  reviewedAt DateTime?
  reviewNote String?
  createdAt DateTime @default(now())
  @@index([userId, date])
  @@index([status])
}

model Demand {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  title String
  client String?
  weight DemandWeight
  points Int            // deriva de weight: SMALL=5 MEDIUM=15 LARGE=30 EPIC=50
  completedAt DateTime
  proofUrl String?
  notes String?
  status DemandStatus @default(PENDING)
  reviewedBy String?
  reviewedAt DateTime?
  reviewNote String?
  createdAt DateTime @default(now())
  @@index([userId, completedAt])
  @@index([status])
}

model Challenge {
  id String @id @default(cuid())
  name String
  startDate DateTime
  endDate DateTime
  bronzeKcal Int @default(24000)
  silverKcal Int @default(30000)
  goldKcal Int @default(34000)
  bronzePoints Int @default(300)
  silverPoints Int @default(600)
  goldPoints Int @default(900)
  bronzeActiveDays Int @default(48)
  silverActiveDays Int @default(72)
  goldActiveDays Int @default(96)
  active Boolean @default(true)
  createdAt DateTime @default(now())
}

model SectorGoal {
  id String @id
  area String
  responsible String
  indicator String
  current Float @default(0)
  bronze Float
  silver Float
  gold Float
  unit String @default("")
  direction GoalDirection @default(HIGHER_IS_BETTER)
  avatarUrl String?
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}
```

| Modelo | Função |
|---|---|
| `User` | Agentes com `role` (USER/ADMIN), `sector`, `avatarUrl` |
| `Activity` | Atividade física: `kcal`, `durationMin`, `status`. Dias ativos = `durationMin ≥ 30` por dia. |
| `Demand` | Demanda de trabalho com `weight` (SMALL/MEDIUM/LARGE/EPIC → 5/15/30/50 pts). Registrada manualmente com print. Sem integração com ClickUp (planejada). |
| `Challenge` | Configuração do período ativo. `getActiveChallenge()` auto-cria se não existir. |
| `SectorGoal` | Meta por área. UI de admin para criação/edição ainda não existe — precisa ser criada. |

**Nomenclatura do banco (Decisão A):** hoje o banco usa nomenclatura padrão do Prisma (PascalCase tabelas, camelCase colunas, **sem `@@map`**). O padrão adotado daqui pra frente é usar `@@map`/`@map` para `snake_case`. **Uma migração para aplicar isso retroativamente ainda está pendente** — não implementar `@@map` em models isolados até essa migração acontecer de forma completa.

**Migrations (Decisão B):** mecanismo atual (sendo substituído) — sem pasta `prisma/migrations/`; dev usa `npx prisma db push`; produção aplica um SQL gerado via `prisma migrate diff --from-empty` rodado via `psql` cru dentro do `CMD` do Dockerfile. Padrão adotado daqui pra frente: `prisma migrate dev --name ...` localmente, `prisma migrate deploy` em produção — requer criar uma migration de baseline primeiro (tarefa de implementação futura, não feita ainda). Até lá, continuar usando `db push`.

---

## Sistema de pontuação (`src/lib/scoring.ts` + `src/lib/challenge.ts`)

**Regra de dias ativos:**
- 1 dia ativo = ≥30 min totais de atividade aprovada no mesmo dia.
- 1 dia ativo = **10 pontos**.
- 1 semana qualificante (≥3 dias ativos) = **+20 pontos de bônus de constância**.

**Fórmula:** `rankingPoints = activeDays × 10 + weeksHitGoal × 20`

**Desempate oficial (ordem de prioridade):**
1. `rankingPoints`
2. `activeDays`
3. `weeksHitGoal`
4. `totalMinutes`

Nunca usa nome, id ou ordem de cadastro como desempate.

**Meta coletiva vs. pontuação coletiva:** o bônus de constância soma pontos mas **não conta como dia ativo** na meta coletiva (48/72/96 dias). `totalCollectiveActiveDays` e `totalCollectivePoints` são calculados separadamente em `ChallengeSnapshot`.

```
src/app/page.tsx  →  buildSnapshot()  →  Prisma (users + activities + demands)
                                      →  computePlayerStats()  (por usuário)
                                      →  compareRank()         (ordenação)
                                      →  rankWithTies()        (colocação com empates)
```

`buildSnapshot()` (`src/lib/challenge.ts`) é a função central do sistema — busca todos os dados de uma vez e devolve o `ChallengeSnapshot` usado por HUB e página de setores.

`medalForTotal(total, bronze, silver, gold)` (`src/lib/scoring.ts`) é a **única** fonte correta de cálculo de medalha/tier — está reimplementada de forma independente em `page.tsx` (`RankRow`), `PodiumShield.tsx` e `MedalGauge.tsx`; qualquer novo código de medalha deve importar dali, não recalcular.

---

## Módulos `src/lib/`

| Arquivo | Função |
|---|---|
| `auth.ts` | Config NextAuth v4 (Credentials Provider, sessão JWT) + `auth()` para Server Components/rotas |
| `challenge.ts` | `buildSnapshot()` + `getActiveChallenge()` |
| `scoring.ts` | `computePlayerStats()`, `computeActiveDaysStats()`, `compareRank()`, `rankWithTies()`, `medalForTotal()`, `WEIGHT_POINTS` |
| `storage.ts` | `saveProof()` — grava uploads em `UPLOADS_DIR`, devolve URL pública `/uploads/...`; `resolveUploadAbsolute()` |
| `audio.ts` | Contexto Web Audio API compartilhado (destravado no primeiro gesto do usuário) |
| `prisma.ts` | Singleton do PrismaClient |

---

## Autenticação (NextAuth v4)

`src/lib/auth.ts`: `NextAuthOptions` com `session: { strategy: "jwt" }`, `CredentialsProvider` (email/senha, `bcrypt.compare` contra `passwordHash`). Callbacks `jwt`/`session` propagam `id`, `role`, `avatarUrl` no token/sessão. `export const auth = () => getServerSession(authOptions)`.

`src/middleware.ts`: usa `withAuth` do NextAuth. Todas as rotas exceto `/login`, `/api/auth`, `/uploads` e assets estáticos exigem sessão. Middleware **não** checa `role` — isso é feito rota a rota (`session.user.role !== "ADMIN"` → 403/redirect).

**Bug de tipo conhecido:** `src/types/next-auth.d.ts` não declara `avatarUrl` em `Session.user`/`JWT`, apesar de ser lido/escrito em runtime — causa ~6 `as any` em `auth.ts`. Corrigir declarando o campo, não mascarando com `any`.

---

## Padrão de rota de API (exemplo real — `activities/route.ts`)

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = await prisma.activity.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" }
  });
  return NextResponse.json({ items });
}
```

Rota admin (`activities/[id]/review/route.ts`): `if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });`; `params` é `Promise<{ id: string }>` no Next 15, precisa `await`.

**Gaps reais e conhecidos (não corrigir "por padrão" fora de escopo, mas não repetir):** zero `try/catch` em qualquer rota; `zod` instalado mas sem uso (validação é `if` manual, `Set` de valores válidos reconstruído por arquivo); checagem de sessão/role duplicada em ~28 pontos, sem `requireAuth()`/`requireAdmin()` centralizado; rotas de revisão de activities/demands estruturalmente idênticas.

---

## Frontend — Server vs. Client Components

Padrão do App Router: Server Component por padrão; `"use client"` só quando precisa de hook/estado/evento de browser. Server Components buscam dado direto via Prisma (sem API própria); Client Components mutam via `fetch()` nativo contra `route.ts`. Sem React Query/Zustand/RHF/Axios/shadcn — estado local (`useState`), formulário HTML + `FormData`, `router.refresh()` para revalidar após mutação.

Design system: Tailwind customizado (`tailwind.config.ts` — cores `val.*`/`rpg.*`, fontes `display`/`mono`, `clip-notch`), classes utilitárias compostas em `globals.css` (`val-card`, `val-btn`, `val-heading`).

**Duplicações conhecidas a não repetir:** mapeamento status→cor/label em 3 lugares divergentes (`StatusBadge.tsx`, `MinhasTable.tsx`, `AllActivitiesHistory.tsx`); `<Th>/<Td>` de tabela em 3+ arquivos; 13 `fetch()` crus sem hook compartilhado (`AdminList.tsx` inclusive silencia erro de resposta); `page.tsx` com ~434 linhas misturando data-fetching e apresentação.

---

## Upload de arquivo

`multipart/form-data`, nunca base64. `saveProof(userId, file)` grava em `UPLOADS_DIR/{userId}/{timestamp}-{random}.{ext}`, devolve `/uploads/{...}`. Servido de volta por rota protegida (`auth()` obrigatório, mas **não** verifica se o solicitante é dono do arquivo — qualquer sessão válida acessa qualquer upload pelo caminho). Limite: 8MB para comprovante de activity/demand, 5MB para avatar — checados como número mágico duplicado em 3 arquivos, não como constante compartilhada. Validação de tipo é só por extensão, não por conteúdo real do arquivo.

---

## Git

Conventional Commits adotado para commits novos (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`). Branches `tipo/descricao-kebab`. **Achado corrigido nesta auditoria:** `uploads/` não estava no `.gitignore` e tinha arquivos reais de usuário commitados — adicionado ao `.gitignore` e destrackeado com `git rm --cached -r uploads` (arquivos locais preservados, histórico antigo do Git ainda os contém).

---

## DevOps / Deploy

Dockerfile multi-stage (`node:20-alpine`), `output: "standalone"` no `next.config.mjs`. `CMD` final: aplica SQL de migration gerado via `prisma migrate diff --from-empty` + `psql`, roda seed, sobe `node server.js` — mecanismo de migration "atual, sendo substituído" (ver Decisão B acima). Deploy via **Coolify**: variáveis `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UPLOADS_DIR=/data/uploads`; volume persistente obrigatório em `/data/uploads` (sem ele, uploads somem a cada redeploy). Sem docker-compose de dev, sem CI/CD automatizado, sem endpoint de health check dedicado, sem estratégia de backup do Postgres documentada — todos gaps reais, não implementados.

---

## Segurança — o que existe / o que falta

Existe: hash bcrypt, sessão JWT via NextAuth, proteção de rota via middleware, RBAC manual por rota, escopo de query por `userId`, proteção contra SQL injection via Prisma, XSS mitigado pelo escape padrão do JSX, uploads atrás de autenticação.

Falta (recomendação, não estado atual): security headers (CSP, X-Frame-Options, HSTS), rate limiting (login e criação), CSRF token explícito nas rotas próprias, validação de mimetype por conteúdo (não só extensão), `npm audit` periódico, backup de banco, `try/catch` nas rotas de API, verificação de dono do arquivo em `/uploads/[...path]` (hoje só verifica sessão válida, não posse).

---

## Comandos essenciais

```bash
npm run dev          # dev server
npm run build        # prisma generate + next build
npm run lint         # ESLint
npm run db:push      # sincroniza schema com o banco (prisma db push) — fluxo atual
npm run db:seed      # popula o banco (idempotente)
npm run db:studio    # Prisma Studio na porta 5555
node tests/e2e.mjs   # testes E2E com Playwright (requer dev server rodando)
```

---

## O que NUNCA fazer (reproduzido do `CLAUDE.md`)

- Nunca peça ao usuário para rodar `npm install`, `prisma ...`, `psql ...`, etc. — **execute você mesmo**.
- Não suba em produção sem a pessoa pedir.
- Não apague o banco sem confirmação.
- Não commite `.env`.
- Não altere `NEXTAUTH_SECRET` (quebra sessões existentes).
- Não use comandos macOS (`brew`, `nohup`, `which`, `/tmp/`) — o ambiente é Windows.

---

## Índice dos arquivos-fonte desta referência

`docs/standards/00-indice.md` · `01-onboarding.md` · `02-arquitetura.md` · `03-nomenclatura-e-padroes.md` · `04-rotas-de-api.md` · `05-frontend.md` · `06-banco-de-dados.md` · `07-autenticacao.md` · `08-api.md` · `09-git-workflow.md` · `10-devops.md` · `11-seguranca.md` · `12-guia-vibecoding.md`
