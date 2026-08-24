# 04 — Rotas de API

> No guia original isso se chamaria "backend" e cobriria NestJS. Aqui não existe backend separado — o "backend" são as rotas de API do Next.js App Router (`route.ts`), e é isso que este arquivo documenta.

---

## 4.1 — O que é uma rota de API aqui, e por que não é NestJS

Uma rota de API no App Router é **um arquivo `route.ts`** dentro de uma pasta cujo caminho vira a URL, exportando funções nomeadas pelos métodos HTTP que ela responde:

```ts
// src/app/api/activities/route.ts
export async function GET() { /* ... */ }
export async function POST(req: NextRequest) { /* ... */ }
export async function DELETE() { /* ... */ }
```

Não existe:
- **Module** — não há agrupamento formal de "recurso" além da própria estrutura de pastas.
- **Controller** — a função `GET`/`POST` já É o ponto de entrada, não delega para outra camada por padrão.
- **Service** — lógica reutilizável vive em `src/lib/*.ts` (ex.: `scoring.ts`, `challenge.ts`, `storage.ts`), importada diretamente pela rota. Não é uma camada obrigatória — para lógica simples, fica direto no `route.ts`.
- **Repository** — o Prisma Client (`src/lib/prisma.ts`) é chamado diretamente. Não há camada de abstração entre a rota e o Prisma.
- **Guard/Pipe/Interceptor/Filter** — a checagem de sessão, validação de input e tratamento de erro são feitas manualmente, no início da função, linha a linha (ver 4.4 sobre o estado real disso).

Se você vem de um projeto NestJS: pense na rota de API como um **Controller que também é Service e também é Repository**, tudo no mesmo arquivo — e sem decorators.

---

## 4.2 — Estrutura de pastas de `src/app/api/`

```
src/app/api/
├── activities/
│   ├── route.ts              # GET (lista minhas), POST (cria), DELETE (apaga todas minhas)
│   └── [id]/
│       ├── route.ts          # operações sobre uma atividade específica
│       └── review/
│           └── route.ts      # POST — aprova/rejeita (admin)
├── demands/
│   ├── route.ts              # GET, POST
│   └── [id]/review/route.ts  # POST — aprova/rejeita (admin)
├── users/
│   ├── route.ts              # GET (lista, admin), POST (cria agente, admin)
│   └── [id]/route.ts         # PATCH/DELETE (admin)
├── profile/
│   └── route.ts              # POST (upload avatar), DELETE (remove avatar) — usuário logado, sobre si mesmo
└── auth/
    └── [...nextauth]/route.ts  # handler padrão do NextAuth (login/logout)
```

`src/app/uploads/[...path]/route.ts` também é um Route Handler, mas fora de `api/` — serve arquivos, não dados JSON (ver `08-api.md` §8.6).

---

## 4.3 — Exemplo real completo: `activities/route.ts`

Este é o código real do projeto (`src/app/api/activities/route.ts`), e é a referência de padrão para qualquer rota nova:

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveProof } from "@/lib/storage";
import { ActivityType } from "@prisma/client";
import { computeActiveDaysStats } from "@/lib/scoring";
import { getActiveChallenge } from "@/lib/challenge";

export const runtime = "nodejs"; // precisa do runtime Node (não Edge) por causa do fs em storage.ts

const validTypes = new Set<ActivityType>([
  "CAMINHADA", "CORRIDA", "CICLISMO", "MUSCULACAO", "FUNCIONAL",
  "DANCA", "NATACAO", "ESPORTE", "TREINO_CASA", "TRILHA", "OUTRA"
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const dateStr = form.get("date") as string;
  const type = form.get("type") as ActivityType;
  const durationMin = form.get("durationMin") ? Number(form.get("durationMin")) : null;
  const notes = (form.get("notes") as string) || null;
  const file = form.get("proof") as File | null;

  if (!dateStr || !type || !validTypes.has(type) || !durationMin || durationMin <= 0) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (file && file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  const proofUrl = file && file.size > 0 ? await saveProof(session.user.id, file) : null;

  const activity = await prisma.activity.create({
    data: {
      userId: session.user.id,
      date: new Date(dateStr + "T12:00:00Z"),
      type, kcal: 0, durationMin, notes, proofUrl,
      status: "APPROVED"
    }
  });

  // Calcula pontos ganhos e se houve bônus de constância nesta atividade específica
  const challenge = await getActiveChallenge();
  const prevActivities = await prisma.activity.findMany({
    where: {
      userId: session.user.id, status: "APPROVED", id: { not: activity.id },
      date: { gte: challenge.startDate, lte: challenge.endDate }
    },
    select: { date: true, durationMin: true }
  });
  const statsBefore = computeActiveDaysStats(prevActivities);
  const statsAfter  = computeActiveDaysStats([...prevActivities, { date: activity.date, durationMin: activity.durationMin }]);
  const dayPointsGained = (statsAfter.activeDays   - statsBefore.activeDays)   * 10;
  const bonusGained     = (statsAfter.weeksHitGoal - statsBefore.weeksHitGoal) * 20;

  return NextResponse.json({ ok: true, id: activity.id, dayPointsGained, bonusGained });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const items = await prisma.activity.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" }
  });
  return NextResponse.json({ items });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { count } = await prisma.activity.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ ok: true, deleted: count });
}
```

**O que observar neste padrão, para replicar em rotas novas:**
1. `auth()` é a primeira linha de qualquer handler protegido — sem sessão, `401` imediato, sem tocar no Prisma.
2. Validação de input é manual: campos obrigatórios checados um a um, tipos válidos contra um `Set` (não deriva de enum do Prisma — ver ressalva abaixo).
3. Toda query que retorna dado do usuário filtra por `userId: session.user.id` — nunca confia em um `id` vindo do client sem essa checagem.
4. Resposta de sucesso: `{ ok: true, ... }` ou `{ items }`/`{ users }` (chave nomeada pelo recurso, no plural, para listas). Resposta de erro: `{ error: "codigo_snake" }` com status HTTP correspondente. **Isso é convenção seguida no código, não garantida em nenhum lugar** — ver 4.4.

---

## 4.4 — O que está documentado como "estado real", não como recomendação ideal

Sendo honesto sobre o código como ele é hoje (o objetivo desta documentação não é vender uma versão idealizada):

- **Checagem de sessão duplicada.** As mesmas 2 linhas (`const session = await auth(); if (!session) return NextResponse.json({error:"unauthorized"}, {status:401});`) se repetem em praticamente toda rota — e a variante "admin" (`session.user.role !== "ADMIN"`) se repete em várias rotas administrativas também. Não existe hoje um helper `requireAuth()`/`requireAdmin()` centralizando isso.
- **Zero `try/catch`.** Nenhuma rota captura exceção do Prisma. Um erro de constraint única (ex.: e-mail duplicado sem passar pelo `findUnique` antes) vira um 500 cru gerado pelo próprio Next.js, num formato diferente do `{ error }` usado no caminho feliz — o formato de erro é consistente só por convenção, não por garantia estrutural.
- **`zod` está instalado (`package.json`) mas tem zero import em `src/`.** Toda validação é `if` manual, e cada rota reconstrói seu próprio `Set` de valores válidos (`validTypes` em `activities/route.ts`, `validWeights` em `demands/route.ts`) em vez de derivar do enum já existente no Prisma (`ActivityType`, `DemandWeight`).
- **Rotas de revisão são estruturalmente idênticas.** `activities/[id]/review/route.ts` e `demands/[id]/review/route.ts` fazem exatamente a mesma coisa (checar admin, ler `action`/`note` do body, atualizar `status`/`reviewedBy`/`reviewedAt`/`reviewNote`), só trocando o model do Prisma.

Isso **não é** prescrição de como escrever a próxima rota do zero — é a realidade documentada, para quem for consertar saber exatamente onde está a duplicação. Ao criar uma rota nova, sinta-se à vontade para já usar um helper de auth compartilhado ou Zod, **se esse helper já existir** no projeto no momento em que você ler isto — confira `src/lib/` antes de reinventar. Se não existir, siga o padrão do exemplo acima (é o que está em produção, e é consistente entre si).

---

## 4.5 — Rota administrativa: exemplo de revisão (`activities/[id]/review/route.ts`)

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, kcal, note } = body as { action: "APPROVE" | "REJECT"; kcal?: number; note?: string };

  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      status: action === "APPROVE" ? "APPROVED" : "REJECTED",
      kcal: action === "APPROVE" && Number.isFinite(kcal) && kcal! > 0 ? Math.round(kcal!) : undefined,
      reviewNote: note || null,
      reviewedBy: session.user.id,
      reviewedAt: new Date()
    }
  });

  return NextResponse.json({ ok: true, activity: updated });
}
```

Note o padrão de rota dinâmica no App Router: `{ params }: { params: Promise<{ id: string }> }` — no Next.js 15, `params` é uma Promise e precisa de `await`. É um detalhe fácil de esquecer vindo de versões anteriores do Next.js ou de outros frameworks.

Para `forbidden` (403), a checagem combinada `!session || session.user.role !== "ADMIN"` numa linha só é o padrão em todas as rotas administrativas do projeto — replique essa forma exata em rotas novas que exigem admin.

---

## 4.6 — Testes

O projeto **não tem testes unitários de rota** hoje (nenhum Jest, nenhum Vitest, nenhum `supertest`). A única cobertura automatizada é o script E2E com Playwright (`tests/e2e.mjs`), que exercita as rotas indiretamente através da UI real: login, criar agente (admin), registrar atividade, registrar demanda, aprovar/rejeitar como admin, bloqueio de rota sem permissão.

Ao alterar uma rota de API:
1. Rodar `npm run build` (garante que os tipos batem).
2. Se a rota estiver no caminho coberto pelo E2E, rodar `node tests/e2e.mjs` com o dev server no ar.
3. Testar manualmente o caso que o E2E não cobre (ex.: um novo campo, um novo código de erro).

Se o time decidir investir em testes unitários das funções puras de `src/lib/` (candidatas óbvias: `scoring.ts`, futuros helpers de revisão), a recomendação é **Vitest**, não Jest — mais rápido de configurar num projeto Next.js/ESM sem setup prévio de teste. Isso é uma sugestão de melhoria, não o estado atual.
