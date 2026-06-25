# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

Este projeto é o **Movimento em Jogo** — plataforma de gamificação da equipe Garcez Consultoria (Next.js + Postgres + NextAuth + Tailwind, identidade visual estilo Valorant).

## Missão do Claude neste repositório

Quando o usuário pedir para **"iniciar"**, **"rodar"**, **"subir"**, **"começar"** ou **"abrir o projeto"**, **você (Claude) é responsável por fazer TUDO sozinho, sem pedir ao usuário para rodar comandos**. Isso inclui:

- Verificar Node.js e PostgreSQL
- Instalar dependências npm
- Rodar as migrations (`prisma db push`)
- Rodar o seed (`npm run db:seed`)
- Subir o servidor de dev
- Fazer health-check e relatar a URL e credenciais

O usuário final é **leigo técnico**. Ele só quer ver o site funcionando no navegador. Nunca diga "rode tal comando" — execute você mesmo.

> **Ambiente:** Windows 10 + PowerShell. Use PowerShell para tudo — nunca `brew`, `nohup`, ou caminhos `/tmp/`.

---

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + **PostgreSQL** local
- **NextAuth v4** (credentials, sessão JWT)
- **Tailwind** (tema Valorant: `src/app/globals.css`, `tailwind.config.ts`)
- **Recharts** para gauges/gráficos
- **Upload local** em `./uploads/` via `src/lib/storage.ts` (rota protegida `/uploads/[...path]`)
- **Playwright** para testes E2E em `tests/e2e.mjs`

## Rotas principais

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

## Credenciais e acesso

- **URL local:** `http://gamificacaogarcezconsultoria.local:3000`
- **PostgreSQL:** `postgresql://postgres:postgres@localhost:5432/movimento_em_jogo`
- **Senha padrão dos usuários:** `movimento2026`
- **Admin:** `garcez@garcez.com`
- **Outros usuários do seed:** `adv1@garcez.com`, `adv2@garcez.com`, `contador@garcez.com`, `assistente@garcez.com`, `estagio@garcez.com`

> O `.env` já está configurado e nunca deve ser recriado do zero — `NEXTAUTH_SECRET` não pode mudar (quebra sessões existentes).

---

## Arquitetura central

### Fluxo de dados no HUB (`/`)

```
src/app/page.tsx  →  buildSnapshot()  →  Prisma (users + activities + demands)
                                      →  computePlayerStats()  (por usuário)
                                      →  compareRank()         (ordenação)
                                      →  rankWithTies()        (colocação com empates)
```

`buildSnapshot()` em `src/lib/challenge.ts` é a **função central do sistema**. Ela busca todos os dados do banco de uma vez e devolve o `ChallengeSnapshot` usado por todas as seções do HUB e da página de setores.

### Sistema de pontuação (`src/lib/scoring.ts`)

**Regra de dias ativos:**
- 1 dia ativo = ≥30 min totais de atividade aprovada no mesmo dia
- 1 dia ativo = **10 pontos**
- 1 semana qualificante (≥3 dias ativos) = **+20 pontos de bônus de constância**

**Fórmula:** `rankingPoints = activeDays × 10 + weeksHitGoal × 20`

**Desempate oficial (em ordem de prioridade):**
1. `rankingPoints` — pontuação total
2. `activeDays` — dias ativos reais
3. `weeksHitGoal` — semanas com meta atingida
4. `totalMinutes` — tempo total de atividades

**Meta coletiva vs. pontuação coletiva:** o bônus de constância soma pontos mas **não conta como dia ativo** na meta coletiva (48/72/96 dias). Os campos `totalCollectiveActiveDays` e `totalCollectivePoints` são calculados separadamente no `ChallengeSnapshot`.

### Modelos Prisma

| Modelo | Função |
|---|---|
| `User` | Agentes com `role` (USER/ADMIN), `sector`, `avatarUrl` |
| `Activity` | Atividade física: `kcal`, `durationMin`, `status`. Dias ativos = `durationMin ≥ 30` por dia. |
| `Demand` | Demanda de trabalho com `weight` (SMALL/MEDIUM/LARGE/EPIC → 5/15/30/50 pts). Registrada manualmente com print. Sem integração com ClickUp (planejada). |
| `Challenge` | Configuração do período ativo. `getActiveChallenge()` auto-cria se não existir (datas hardcoded jun–jul 2026). |
| `SectorGoal` | Meta por área: `current`, `bronze`/`silver`/`gold`, `direction` (HIGHER_IS_BETTER ou LOWER_IS_BETTER). **UI de admin para criação/edição ainda não existe — precisa ser criada.** |

### Módulos `src/lib/`

| Arquivo | Função |
|---|---|
| `auth.ts` | Configuração NextAuth + helper `auth()` para Server Components |
| `challenge.ts` | `buildSnapshot()` + `getActiveChallenge()` |
| `scoring.ts` | `computePlayerStats()`, `computeActiveDaysStats()`, `compareRank()`, `rankWithTies()` |
| `storage.ts` | `saveProof()` — grava uploads em `UPLOADS_DIR` e devolve URL pública `/uploads/...` |
| `audio.ts` | Contexto Web Audio API compartilhado (destravado no primeiro gesto do usuário) |
| `prisma.ts` | Singleton do PrismaClient |

### Auth e middleware

`src/middleware.ts` usa `withAuth` do NextAuth. Todas as rotas exceto `/login`, `/api/auth`, `/uploads` e assets estáticos exigem sessão. Role ADMIN é verificada nas próprias páginas/rotas de API via `session.user.role`.

---

## Comandos úteis

```bash
npm run dev          # dev server
npm run build        # prisma generate + next build
npm run lint         # ESLint
npm run db:push      # sincroniza schema com o banco (prisma db push)
npm run db:seed      # popula o banco (idempotente)
npm run db:studio    # Prisma Studio na porta 5555
node tests/e2e.mjs   # testes E2E com Playwright (requer dev server rodando)
```

---

## Runbook — "rodar o projeto do zero" (Windows)

Execute passo a passo via PowerShell, em ordem:

### 1. Verificar Node.js (≥20)

```powershell
node --version
```

Se falhar: instale pelo site nodejs.org ou com `winget install OpenJS.NodeJS.LTS`.

### 2. Verificar PostgreSQL

```powershell
psql --version
```

Se falhar: instale pelo site postgresql.org. Usuário padrão: `postgres`, senha: `postgres`. Confirme que o serviço está rodando (`services.msc` → procure por "postgresql").

### 3. Garantir o banco `movimento_em_jogo`

```powershell
psql -h localhost -U postgres -c "CREATE DATABASE movimento_em_jogo;" 2>$null
psql -h localhost -U postgres -c "SELECT datname FROM pg_database WHERE datname='movimento_em_jogo';"
```

Se pedir senha, é `postgres`.

### 4. Verificar o `.env`

O arquivo `.env` já existe e está configurado. **Não recrie nem altere o `NEXTAUTH_SECRET`.**

Se por algum motivo não existir, crie com exatamente este conteúdo:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movimento_em_jogo"
NEXTAUTH_SECRET="KpJ4SFCSlHFn5ZQ3bgUa7uRSEvx0ngWO/fILTAKPQDs="
NEXTAUTH_URL="http://gamificacaogarcezconsultoria.local:3000"
UPLOADS_DIR="./uploads"
SEED_PASSWORD="movimento2026"
```

### 5. Instalar dependências

```powershell
npm install
```

### 6. Sincronizar schema + seed

```powershell
npx prisma generate
npx prisma db push --skip-generate
npm run db:seed
```

### 7. Subir o servidor

O usuário pode usar o arquivo `iniciar-servidor.bat` (duplo clique) ou:

```powershell
npm run dev
```

O servidor sobe na porta 3000. Se a porta estiver ocupada, o Next usa 3001/3003.

### 8. Health-check

```powershell
Invoke-WebRequest -Uri "http://gamificacaogarcezconsultoria.local:3000/login" -UseBasicParsing | Select-Object StatusCode
```

StatusCode 200 → ok.

> **Se o domínio não resolver:** o arquivo `hosts` do Windows (`C:\Windows\System32\drivers\etc\hosts`) precisa ter a linha `127.0.0.1 gamificacaogarcezconsultoria.local`. Se não tiver, adicione (requer administrador).

### 9. Reportar ao usuário

Avise que o site está aberto em `http://gamificacaogarcezconsultoria.local:3000` e passe o login padrão (`garcez@garcez.com` / `movimento2026`).

---

## Troubleshooting que o Claude deve resolver sozinho

- **Erro de Prisma após mudar `schema.prisma`:**
  → `npx prisma generate` + deletar pasta `.next` + reiniciar dev.

- **Login falha com "Invalid credentials":**
  → Confirme que `NEXTAUTH_URL` no `.env` bate com a URL/porta real. Ajuste e reinicie.

- **Domínio não resolve no navegador:**
  → Verificar e adicionar `127.0.0.1 gamificacaogarcezconsultoria.local` no arquivo `hosts` do Windows.

- **Porta 3000 ocupada:**
  → Deixe o Next escolher outra porta. Atualize `NEXTAUTH_URL` no `.env` e reinicie.

- **Upload retorna 500:**
  → Confirmar que `./uploads/` existe e tem permissão de escrita.

- **DB vazio / sem usuários:**
  → `npm run db:seed` (é idempotente).

- **Mudou schema Prisma:**
  → Sempre: `npx prisma db push --skip-generate && npx prisma generate` + deletar `.next` + reiniciar.

- **Servidor caiu:**
  → Verificar erros no terminal onde `npm run dev` estava rodando. Corrigir e reiniciar.

---

## Testes E2E

```bash
node tests/e2e.mjs
```

Requer o dev server rodando. Cobre: login admin/user, HUB, criar agente, registrar atividade + demanda, aprovação admin, bloqueio de rotas. Screenshots em `tests/screenshots/`.

---

## O que NUNCA fazer

- Nunca peça ao usuário para rodar `npm install`, `prisma ...`, `psql ...`, etc. — **execute você mesmo**.
- Não suba em produção sem a pessoa pedir.
- Não apague o banco sem confirmação.
- Não commite `.env`.
- Não altere `NEXTAUTH_SECRET` (quebra sessões existentes).
- Não use comandos macOS (`brew`, `nohup`, `which`, `/tmp/`) — o ambiente é Windows.

---

## Deploy em Coolify (quando chegar a hora)

- Usar o `Dockerfile` já existente na raiz do projeto.
- Variáveis que o Coolify precisa setar: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UPLOADS_DIR=/data/uploads`.
- Montar volume persistente em `/data/uploads` (os prints ficam aí).
- O `CMD` do Dockerfile já aplica o schema via SQL puro, roda o seed e sobe o servidor.
