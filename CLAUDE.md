# CLAUDE.md — Instruções para o Claude Code

Este projeto é o **Movimento em Jogo** (Next.js + Postgres + NextAuth + Tailwind, identidade visual estilo Valorant).

## Missão do Claude neste repositório

Quando o usuário pedir para **"iniciar"**, **"rodar"**, **"subir"**, **"começar"** ou **"abrir o projeto"**, **você (Claude) é responsável por fazer TUDO sozinho, sem pedir ao usuário para rodar comandos**. Isso inclui:

- Instalar dependências do sistema operacional (Node.js, PostgreSQL) se faltarem
- Instalar dependências npm
- Criar o banco de dados local
- Rodar as migrations (`prisma db push`)
- Rodar o seed (`npm run db:seed`)
- Subir o servidor de dev em background
- Fazer health-check e relatar a URL e credenciais

O usuário final é **leigo técnico**. Ele só quer ver o site funcionando no navegador. Nunca diga "rode tal comando" — execute você mesmo com Bash.

---

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + **PostgreSQL** local
- **NextAuth** (credentials)
- **Tailwind** (tema Valorant: `src/app/globals.css`, `tailwind.config.ts`)
- **Upload local** em `./uploads/` via `src/lib/storage.ts` (rota protegida `/uploads/[...path]`)
- **Playwright** pra testes E2E em `tests/e2e.mjs`

## Rotas principais

| Rota | Quem acessa | Função |
|---|---|---|
| `/login` | público | Auth |
| `/` | qualquer logado | HUB: metas coletivas + 4 rankings |
| `/registrar` | qualquer logado | Form atividade física + upload do print |
| `/minhas` | qualquer logado | Histórico de atividades |
| `/demandas` | qualquer logado | Histórico de demandas ClickUp |
| `/demandas/nova` | qualquer logado | Form de demanda |
| `/admin` | ADMIN | Fila de validação (atividades + demandas) |
| `/admin/usuarios` | ADMIN | CRUD de agentes |

## Credenciais do seed

Senha default: `movimento2026`. Usuários criados pelo seed:
- `garcez@garcez.com` (ADMIN)
- `adv1@garcez.com`, `adv2@garcez.com`, `contador@garcez.com`, `assistente@garcez.com`, `estagio@garcez.com`

---

## Runbook — "rodar o projeto do zero"

Execute passo a passo via Bash, em ordem. Pule um passo só se já estiver resolvido:

### 1. Verificar Node.js

```bash
node --version
```

- Se o comando falhar ou a versão for menor que 20, instale: `brew install node@20` (macOS).

### 2. Verificar/iniciar PostgreSQL

```bash
which psql && brew services list | grep -i postgres
```

- Se faltar o binário: `brew install postgresql@16`
- Se não estiver rodando: `brew services start postgresql@16`

### 3. Garantir o banco `movimento_em_jogo`

```bash
psql -h localhost -U "$USER" -d postgres -c "CREATE DATABASE movimento_em_jogo;" 2>/dev/null || true
psql -h localhost -U "$USER" -d postgres -c "SELECT datname FROM pg_database WHERE datname='movimento_em_jogo';"
```

### 4. Criar `.env` se não existir

```bash
[ -f .env ] || cat > .env <<EOF
DATABASE_URL="postgresql://$USER@localhost:5432/movimento_em_jogo"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
UPLOADS_DIR="./uploads"
SEED_PASSWORD="movimento2026"
EOF
```

> **Atenção:** se o servidor acabar subindo numa porta diferente (3001, 3003...), atualize `NEXTAUTH_URL` no `.env` e reinicie o dev. O login quebra se a URL não bater.

### 5. Instalar dependências

```bash
npm install
```

### 6. Sincronizar schema + seed

```bash
npx prisma generate
npx prisma db push --skip-generate
npm run db:seed
```

### 7. Subir o servidor em background

```bash
nohup npm run dev > /tmp/movimento-dev.log 2>&1 &
sleep 8
tail -20 /tmp/movimento-dev.log
```

### 8. Health-check

```bash
curl -sI http://localhost:3000/login | head -2
```

Se retornou `HTTP/1.1 200` → ok. Se a porta 3000 estava ocupada, o Next usa 3001/3003. Pegue a URL real do log e informe ao usuário.

### 9. Reportar ao usuário

Avise que o site está aberto em `http://localhost:<porta>` e passe o login padrão (`garcez@garcez.com` / `movimento2026`).

---

## Troubleshooting que o Claude deve resolver sozinho

- **"Unknown field demands on User"** (ou qualquer erro de Prisma após mudar `schema.prisma`):
  → Rode `npx prisma generate && rm -rf .next` e reinicie o dev server.

- **Login falha com "Invalid credentials"**:
  → Confirme que `NEXTAUTH_URL` no `.env` bate com a porta real do dev server. Ajuste e reinicie.

- **Porta 3000 ocupada**:
  → Deixe o Next escolher outra porta. Só atualize `NEXTAUTH_URL` e reinicie.

- **Upload 500**:
  → Confira que `./uploads/` existe e tem permissão de escrita.

- **Servidor morreu / 502**:
  → `tail -80 /tmp/movimento-dev.log` pra ver o stack, corrija e reinicie.

- **DB vazio / sem usuários**:
  → Rode `npm run db:seed` novamente (é idempotente).

- **Mudou schema Prisma**:
  → Sempre: `npx prisma db push --skip-generate && npx prisma generate && rm -rf .next` e reinicie o dev.

---

## Testes E2E

Rodar suíte completa via Playwright:

```bash
node tests/e2e.mjs
```

Requer o dev server rodando. Cobre: login admin/user, HUB, criar agente, registrar atividade + demanda, aprovação admin, bloqueio de rotas. Screenshots em `tests/screenshots/`.

---

## O que NUNCA fazer

- Nunca peça ao usuário para rodar `npm install`, `prisma ...`, `brew install ...`, `psql ...`, etc. — **execute você mesmo**.
- Não suba em produção sem a pessoa pedir.
- Não apague o banco sem confirmação.
- Não commite `.env`.
- Não altere `NEXTAUTH_SECRET` depois de criado (quebra sessões existentes).

---

## Para deploy em Coolify (quando chegar a hora)

- O projeto funciona com Docker direto (`next build && next start`).
- Variáveis que o Coolify precisa setar: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UPLOADS_DIR=/data/uploads`.
- Montar volume persistente em `/data/uploads` (os prints ficam aí).
- Rodar `npx prisma db push` após cada deploy que muda schema.
