# 06 — Banco de Dados

> PostgreSQL + Prisma. Este arquivo contém duas decisões já tomadas pelo time sobre nomenclatura (§6.2) e migrations (§6.3) — leia essas seções com atenção antes de mexer no schema.

---

## 6.1 — O que é o Prisma, rapidamente

Prisma é o ORM: você descreve os "models" (tabelas) e campos num único arquivo (`prisma/schema.prisma`), e ele gera automaticamente um cliente TypeScript totalmente tipado (`@prisma/client`) — `prisma.activity.create({...})` tem autocomplete e checagem de tipo para cada campo, porque o tipo `Activity` foi gerado direto do schema. Isso elimina a categoria de bug "o campo no banco tem nome diferente do campo no código".

---

## 6.2 — Schema real do projeto

```prisma
// prisma/schema.prisma — completo

enum Role { USER  ADMIN }
enum ActivityStatus { PENDING  APPROVED  REJECTED }
enum DemandStatus { PENDING  APPROVED  REJECTED }
enum ActivityType {
  CAMINHADA  CORRIDA  CICLISMO  MUSCULACAO  FUNCIONAL
  DANCA  NATACAO  ESPORTE  TREINO_CASA  TRILHA  OUTRA
}
enum DemandWeight {
  SMALL   // 5 pts
  MEDIUM  // 15 pts
  LARGE   // 30 pts
  EPIC    // 50 pts
}
enum GoalDirection { HIGHER_IS_BETTER  LOWER_IS_BETTER }

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  name         String
  passwordHash String
  role         Role       @default(USER)
  avatarUrl    String?
  sector       String?
  createdAt    DateTime   @default(now())
  activities   Activity[]
  demands      Demand[]
}

model Activity {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  date        DateTime
  type        ActivityType
  kcal        Int
  durationMin Int?
  notes       String?
  proofUrl    String?
  status      ActivityStatus @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  reviewNote  String?
  createdAt   DateTime       @default(now())

  @@index([userId, date])
  @@index([status])
}

model Demand {
  id          String       @id @default(cuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  client      String?
  weight      DemandWeight
  points      Int
  completedAt DateTime
  proofUrl    String?
  notes       String?
  status      DemandStatus @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  reviewNote  String?
  createdAt   DateTime     @default(now())

  @@index([userId, completedAt])
  @@index([status])
}

model Challenge {
  id               String   @id @default(cuid())
  name             String
  startDate        DateTime
  endDate          DateTime
  bronzeKcal       Int      @default(24000)
  silverKcal       Int      @default(30000)
  goldKcal         Int      @default(34000)
  bronzePoints     Int      @default(300)
  silverPoints     Int      @default(600)
  goldPoints       Int      @default(900)
  bronzeActiveDays Int      @default(48)
  silverActiveDays Int      @default(72)
  goldActiveDays   Int      @default(96)
  active           Boolean  @default(true)
  createdAt        DateTime @default(now())
}

model SectorGoal {
  id          String        @id
  area        String
  responsible String
  indicator   String
  current     Float         @default(0)
  bronze      Float
  silver      Float
  gold        Float
  unit        String        @default("")
  direction   GoalDirection @default(HIGHER_IS_BETTER)
  avatarUrl   String?
  updatedAt   DateTime      @updatedAt
  createdAt   DateTime      @default(now())
}
```

| Model | Função |
|---|---|
| `User` | Agentes da equipe, com `role` (`USER`/`ADMIN`), `sector`, `avatarUrl` |
| `Activity` | Atividade física registrada. Dias ativos = `durationMin ≥ 30` no dia. `kcal` é campo legado, fixado em `0` na criação hoje. |
| `Demand` | Demanda de trabalho, com `weight` (`SMALL`/`MEDIUM`/`LARGE`/`EPIC` → 5/15/30/50 pts). Registrada manualmente com comprovante — sem integração automática com ClickUp. |
| `Challenge` | Configuração do período ativo do desafio. `getActiveChallenge()` cria um registro automaticamente se nenhum existir. |
| `SectorGoal` | Meta por área/setor. UI de admin para criar/editar ainda não existe no frontend — é um gap conhecido, não uma omissão de schema. |

### Decisão A — nomenclatura de tabelas/colunas (`@@map`/`@map`)

**Estado atual (hoje, em produção):** o banco usa a nomenclatura **padrão do Prisma**, sem `@@map` nem `@map` em nenhum model. Isso significa que os nomes reais das tabelas e colunas no PostgreSQL são idênticos aos nomes usados no `schema.prisma` acima — tabelas em PascalCase (`"User"`, `"Activity"`, `"SectorGoal"`), colunas em camelCase (`"userId"`, `"durationMin"`, `"avatarUrl"`). Se você rodar `psql` e fizer `\d "Activity"`, é exatamente isso que vai ver.

**Padrão adotado daqui pra frente:** o time decidiu adotar `@@map`/`@map` para expor `snake_case` no banco, mantendo PascalCase/camelCase no schema e no TypeScript gerado. Ficaria assim:

```prisma
// alvo — ainda NÃO aplicado
model Activity {
  id          String         @id @default(cuid())
  userId      String         @map("user_id")
  date        DateTime
  type        ActivityType
  durationMin Int?           @map("duration_min")
  proofUrl    String?        @map("proof_url")
  reviewedBy  String?        @map("reviewed_by")
  reviewedAt  DateTime?      @map("reviewed_at")
  reviewNote  String?        @map("review_note")
  createdAt   DateTime       @default(now()) @map("created_at")

  @@index([userId, date])
  @@index([status])
  @@map("activities")
}
```

**Uma migração para aplicar isso retroativamente ainda está pendente.** Ela precisa:
1. Renomear as tabelas e colunas existentes no banco de produção (via SQL de migration, ver Decisão B abaixo) para bater com os novos `@map`.
2. Ser testada contra uma cópia do banco de produção antes de rodar de verdade, porque `ALTER TABLE ... RENAME` em produção sem plano de rollback é arriscado.
3. Ser feita de uma vez para todos os models — misturar alguns models com `@map` e outros sem, só porque um model foi tocado por outro motivo, criaria uma inconsistência pior do que o estado atual.

Essa migração é uma **tarefa de implementação futura, fora do escopo desta documentação**. Até ela acontecer: trate o schema atual (sem `@map`) como o estado real e válido do projeto.

---

## 6.3 — Migrations

### Decisão B — estratégia de migração

**Mecanismo atual (sendo substituído):**

Hoje **não existe** a pasta `prisma/migrations/` — o projeto nunca usou o fluxo incremental padrão do Prisma (`prisma migrate dev`/`deploy`). O fluxo real é:

- **Em desenvolvimento:** `npx prisma db push` — compara o `schema.prisma` com o estado atual do banco e aplica a diferença diretamente, sem gerar nem guardar um arquivo de migration. É rápido para iterar, mas não deixa histórico de "o que mudou e quando" além do próprio histórico do Git do `schema.prisma`.
- **Em produção (Coolify, via `Dockerfile`):** o build gera um SQL "do zero" com `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`, e o `CMD` do container roda esse SQL cru via `psql` diretamente contra o banco, antes de subir o servidor:

```dockerfile
# Dockerfile — trecho real
RUN npx prisma migrate diff \
      --from-empty \
      --to-schema-datamodel prisma/schema.prisma \
      --script \
      > /tmp/migration.sql 2>/dev/null || true
# ...
CMD ["sh", "-c", "psql $DATABASE_URL -f /app/prisma/migration.sql 2>/dev/null; node /app/prisma/seed.js 2>/dev/null; node server.js"]
```

Isso funciona porque o script gerado usa `CREATE TABLE IF NOT EXISTS`-like idempotência suficiente para não quebrar num banco que já tem os dados (os erros são silenciados com `2>/dev/null` e `|| true`) — mas **não é o fluxo padrão de migrations do Prisma**, é um workaround. Ele não versiona incrementos (cada deploy gera o "diff do zero" de novo, não um passo a passo do que mudou desde o último deploy), e depende de `psql` estar instalado na imagem final (está, via `apk add postgresql-client`).

**Padrão adotado daqui pra frente:**

O time decidiu adotar o fluxo padrão do Prisma:
- **Localmente**, ao mudar o schema: `npx prisma migrate dev --name descricao_da_mudanca` — gera um arquivo SQL versionado em `prisma/migrations/`, aplica no banco local, e atualiza o client.
- **Em CI/deploy**: `npx prisma migrate deploy` — aplica só as migrations pendentes, sem gerar nada novo, seguro para rodar em produção.

```bash
# fluxo novo, local, ao mudar o schema
npx prisma migrate dev --name adiciona_campo_x_em_activity
git add prisma/migrations/
git commit -m "feat: adiciona campo x em Activity"
```

**Isso exige uma migração de baseline antes de poder ser usado.** Como o banco de produção já existe e nunca teve uma pasta `migrations/`, adotar `migrate dev`/`deploy` requer primeiro criar uma **migration inicial "baseline"** que represente o schema atual como se fosse a primeira migration, e marcá-la como já aplicada no banco de produção (`prisma migrate resolve --applied <nome>`), para que o Prisma não tente recriar tabelas que já existem. Isso é uma **tarefa de implementação futura separada**, não feita como parte desta documentação — envolve mexer no Dockerfile (trocar o passo `migrate diff --from-empty` + `psql` por `migrate deploy`) e testar contra uma cópia do banco de produção antes de aplicar de verdade.

**Resumindo o que fazer até essa tarefa ser concluída:**
- Continue usando `npx prisma db push` localmente para iterar no schema (é o comando hoje documentado em `CLAUDE.md` e nos scripts do `package.json` — `npm run db:push`).
- Não crie manualmente uma pasta `prisma/migrations/` nem rode `prisma migrate dev` isoladamente sem a baseline — isso deixaria o histórico de migrations inconsistente com o banco real de produção.
- Trate a adoção de `migrate dev`/`deploy` como uma mudança de infraestrutura planejada, documentada em `10-devops.md`, não algo a fazer ad-hoc numa PR de feature.

---

## 6.4 — Seed

`prisma/seed.ts`, rodado via `npm run db:seed` (script real: `node --env-file=.env --import tsx prisma/seed.ts`). É **idempotente** — pode ser rodado múltiplas vezes sem duplicar dados (usa `upsert` ou checa existência antes de criar). Popula o admin (`garcez@garcez` — sem `.com`) e os usuários de teste do time, todos com a senha definida em `SEED_PASSWORD` no `.env`.

---

## 6.5 — Queries e patterns observados no projeto

**Singleton do PrismaClient** (evita esgotar conexões em dev com hot-reload):
```ts
// src/lib/prisma.ts — completo, real
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**`include`/`select` para trazer relação já resolvida** (padrão real de `buildSnapshot()`):
```ts
const users = await prisma.user.findMany({
  include: {
    activities: {
      where: { status: "APPROVED", date: { gte: challenge.startDate, lte: challenge.endDate } },
      select: { date: true, kcal: true, durationMin: true }
    },
    demands: {
      where: { status: "APPROVED", completedAt: { gte: challenge.startDate, lte: challenge.endDate } },
      select: { points: true, weight: true }
    }
  }
});
```

**`Promise.all` para contagens paralelas** (padrão real, também de `challenge.ts`):
```ts
const [approvedActivities, pendingActivities, approvedDemands, pendingDemands] =
  await Promise.all([
    prisma.activity.count({ where: { status: "APPROVED", /* ... */ } }),
    prisma.activity.count({ where: { status: "PENDING" } }),
    prisma.demand.count({ where: { status: "APPROVED", /* ... */ } }),
    prisma.demand.count({ where: { status: "PENDING" } })
  ]);
```

**O que o projeto não usa hoje:** transações explícitas (`prisma.$transaction`), soft delete (deleções são `deleteMany` reais — ver `activities` DELETE, que apaga de verdade), paginação (ver `08-api.md` §8.5), nem `$queryRaw` (nenhuma query SQL crua fora do workaround de migration do Dockerfile).

---

## 6.6 — Performance

- **Índices reais existentes:** `@@index([userId, date])` e `@@index([status])` em `Activity`; `@@index([userId, completedAt])` e `@@index([status])` em `Demand` — cobrem os filtros mais comuns (listagem "minhas atividades", fila de pendências admin).
- **Connection pooling:** não há PgBouncer nem pool configurado explicitamente além do que o Prisma Client já gerencia por padrão — adequado para o volume atual (equipe pequena), mas um ponto a revisitar se o número de conexões simultâneas crescer.
- **N+1:** o padrão de `include`/`select` mostrado em 6.5 evita N+1 nas telas principais (busca usuários com suas atividades/demandas numa única query, em vez de uma query por usuário). Ao adicionar uma tela nova que itera sobre uma lista fazendo uma query Prisma por item, prefira `include` ou `findMany` com `where: { id: { in: [...] } }`.
