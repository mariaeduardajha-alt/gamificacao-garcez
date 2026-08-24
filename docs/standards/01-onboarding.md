# 01 — Onboarding

> Bem-vindo(a) ao Movimento em Jogo. Leia este arquivo antes de qualquer coisa.

---

## 1.1 — Filosofia de desenvolvimento

- **Velocidade com qualidade.** Vibecoding (usar LLM para escrever a maior parte do código) permite as duas coisas ao mesmo tempo — desde que a documentação seja seguida, não improvisada.
- **Padronização > velocidade individual.** Entregar rápido de um jeito que não bate com o resto do código gera mais trabalho depois (ver os "achados reais" em `12-guia-vibecoding.md`: lógica duplicada em 3+ lugares, checagem de sessão copiada 22 vezes) do que entregar no padrão certo desde o início.
- **Se não está documentado, não existe.** Um comportamento novo do sistema (regra de pontuação, novo status, nova permissão) só está "pronto" quando o `CLAUDE.md` ou o arquivo relevante de `docs/standards/` reflete a mudança.
- **LLM é ferramenta, não substituto de pensamento crítico.** Revisar o que a LLM gerou — principalmente checagem de sessão/role e queries que filtram por `userId` — é parte do trabalho, não um passo opcional.

---

## 1.2 — Glossário técnico

| Termo | O que é | Onde você encontra no projeto |
|---|---|---|
| **App Router** | O sistema de rotas do Next.js baseado em pastas dentro de `src/app/` — cada pasta com `page.tsx` vira uma URL. | `src/app/registrar/page.tsx` → rota `/registrar` |
| **Route Handler** | Um arquivo `route.ts` que exporta funções `GET`/`POST`/`DELETE` — é a "rota de API" do Next.js. | `src/app/api/activities/route.ts` |
| **Server Component** | Componente React que roda **só no servidor**, pode acessar banco direto, nunca manda JS extra pro browser. É o padrão do App Router. | `src/app/page.tsx` (busca dados via `buildSnapshot()` direto) |
| **Client Component** | Componente com `"use client"` no topo — roda no browser, pode usar `useState`, `onClick`, hooks. | `src/app/admin/AdminList.tsx` |
| **Middleware** | Código que roda antes da request chegar na página/rota — o "porteiro". Aqui, verifica se existe sessão. | `src/middleware.ts` |
| **ORM (Prisma)** | Tradutor entre TypeScript e SQL — você escreve `prisma.activity.create(...)`, ele gera o `INSERT` correspondente. | `src/lib/prisma.ts`, qualquer `route.ts` |
| **Schema (Prisma)** | Arquivo que descreve os models (tabelas) e campos do banco. | `prisma/schema.prisma` |
| **Model** | Uma "tabela" no vocabulário do Prisma (`User`, `Activity`, `Demand`...). | `prisma/schema.prisma` |
| **Enum** | Lista fixa de valores válidos para um campo (`ActivityStatus`: `PENDING`/`APPROVED`/`REJECTED`). | `prisma/schema.prisma` |
| **Migration** | Registro de uma mudança na estrutura do banco. **Hoje o projeto não usa migrations tradicionais** — usa `prisma db push` (aplica o schema direto, sem histórico). Ver `06-banco-de-dados.md`. | — |
| **Seed** | Script que popula o banco com dados iniciais (usuários de teste, admin). | `prisma/seed.ts`, `npm run db:seed` |
| **Session / JWT** | Depois do login, o NextAuth guarda um token assinado (JWT) num cookie — é isso que identifica quem está logado em cada request. | `src/lib/auth.ts` |
| **RBAC** | Controle de acesso por papel (`role`). Aqui só existem dois: `USER` e `ADMIN`. | `session.user.role === "ADMIN"` em várias rotas |
| **Hook (React)** | Função especial do React tipo `useState`, `useEffect`, que só pode ser usada dentro de Client Components. | `useState` em `AdminList.tsx` |
| **CORS** | Regra do browser sobre quem pode chamar sua API de outro domínio. Não é um problema aqui porque frontend e API são o mesmo domínio/processo. | — |
| **CSRF** | Ataque que engana o browser da vítima pra mandar uma request indevida usando a sessão dela. Não há proteção explícita hoje — ver `11-seguranca.md`. | — |
| **XSS** | Injeção de script malicioso via input não sanitizado. React escapa JSX por padrão, mas `dangerouslySetInnerHTML` e uso indevido de `<img src>`/links de usuário podem reabrir a brecha. | — |
| **SQL Injection** | Injeção de SQL via input não sanitizado. O Prisma parametriza queries automaticamente — risco baixo enquanto não se usa `$queryRawUnsafe` com string concatenada. | — |
| **Environment variable (`.env`)** | Configuração sensível (senha de banco, segredo de sessão) fora do código-fonte. | `.env` (nunca commitado), `.env.example` (template) |
| **Docker / Dockerfile** | Empacota o app numa imagem que roda igual em qualquer lugar. Usado só para build/deploy — não para desenvolvimento local aqui. | `Dockerfile` |
| **Coolify** | Plataforma de deploy self-hosted usada em produção — recebe a imagem Docker e sobe o container. | Ver `10-devops.md` |
| **PR (Pull Request)** | Proposta de mudança revisada antes de entrar em `main`. | Ver `09-git-workflow.md` |
| **Branch** | Linha paralela de desenvolvimento a partir de `main`. | Ver `09-git-workflow.md` |

---

## 1.3 — A stack real (com justificativa)

| Tecnologia | Papel | Por quê |
|---|---|---|
| **TypeScript** | Linguagem | Tipagem reduz bugs de campo errado/undefined, essencial num projeto sem testes unitários hoje |
| **Next.js 15 (App Router)** | Frontend **e** backend, no mesmo processo | Um único deploy, Server Components eliminam boa parte da necessidade de uma API separada só para leitura |
| **PostgreSQL** | Banco de dados | Robusto, relacional, gratuito, o padrão de fato para esse tipo de aplicação |
| **Prisma** | ORM | Schema único gera tipos TypeScript automaticamente — o `Activity` do banco e o `Activity` do TypeScript nunca dessincronizam |
| **NextAuth v4** | Autenticação | Sessão JWT via cookie, provider de credenciais (email/senha) — sem precisar implementar hash/token/refresh na mão |
| **Tailwind CSS** | Estilização | Utility-first, tema customizado (`tailwind.config.ts`) implementa a identidade visual tática/"Valorant" do projeto sem CSS solto |
| **Recharts** | Gráficos/gauges | Usado nos medidores de progresso (medalhas, meta coletiva) |
| **Playwright** | Teste E2E | Único teste automatizado do projeto hoje — cobre login, HUB, criação de agente, registro de atividade/demanda, aprovação admin, bloqueio de rota |

**O que este projeto explicitamente NÃO usa** (para não confundir quem vem de outro stack): NestJS, React Query, Zustand, React Hook Form, Axios, shadcn/ui, Jest, docker-compose de desenvolvimento. Se alguma dessas tecnologias aparecer sugerida em código gerado por LLM, é um desvio do padrão real — ver `12-guia-vibecoding.md` §12.5.

---

## 1.4 — Setup do ambiente (Windows)

O runbook completo, passo a passo, com todos os comandos PowerShell, já existe e é mantido em um único lugar: **seção "Runbook — 'rodar o projeto do zero' (Windows)" do [`CLAUDE.md`](../../CLAUDE.md)**. Não duplicamos aqui para não arriscar os dois textos ficarem dessincronizados — siga o `CLAUDE.md`.

Resumo do que ele cobre: verificar Node.js ≥20 e PostgreSQL, garantir o banco `movimento_em_jogo`, conferir o `.env` (nunca recriar do zero — `NEXTAUTH_SECRET` não pode mudar), `npm install`, `npx prisma generate` + `npx prisma db push --skip-generate` + `npm run db:seed`, subir com `npm run dev` (ou `iniciar-servidor.bat`), health-check em `/login`.

Se você é a pessoa não-técnica usando Claude Code: basta abrir o Claude Code nesta pasta e pedir para "iniciar o projeto" — ele executa tudo sozinho, é a missão descrita no topo do `CLAUDE.md`.

Extensões de editor recomendadas (não obrigatórias hoje, mas ajudam): extensão oficial do Prisma (syntax highlight de `schema.prisma`), Tailwind CSS IntelliSense, ESLint.

---

## 1.5 — Seu primeiro dia: checklist

1. Ler este documento (`01-onboarding.md`) inteiro.
2. Rodar o setup do ambiente — ou pedir para o Claude Code fazer, seguindo o `CLAUDE.md`.
3. Ler [`02-arquitetura.md`](./02-arquitetura.md).
4. Deixar [`03-nomenclatura-e-padroes.md`](./03-nomenclatura-e-padroes.md) aberto como referência do dia a dia.
5. Ler [`04-rotas-de-api.md`](./04-rotas-de-api.md) e/ou [`05-frontend.md`](./05-frontend.md), conforme a área que for mexer primeiro.
6. Ler [`12-guia-vibecoding.md`](./12-guia-vibecoding.md) antes de pedir a primeira tarefa para uma LLM.
7. Pegar a primeira tarefa pequena (ex.: um ajuste de UI ou uma correção documentada nos "achados" de `12-guia-vibecoding.md`) para se familiarizar com o fluxo antes de mexer em pontuação/auth.
