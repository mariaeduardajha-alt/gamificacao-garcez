# CLAUDE.md

Manual operacional do Claude Code neste repositório: como rodar, credenciais, problemas comuns e regras inegociáveis.
Para **o que é o projeto e onde fica cada coisa**, veja o [`README.md`](./README.md). Para **arquitetura, regras do jogo e padrões de código**, veja [`docs/`](./docs/).

---

Este projeto é o **Movimento em Jogo** — plataforma de gamificação da equipe Garcez Consultoria (Next.js 15 + Prisma/PostgreSQL + NextAuth + Tailwind, visual estilo Valorant).

## Missão do Claude neste repositório

Quando o usuário pedir para **"iniciar"**, **"rodar"**, **"subir"**, **"começar"** ou **"abrir o projeto"**, **você (Claude) faz TUDO sozinho, sem pedir ao usuário para rodar comandos**: verificar Node.js e PostgreSQL, instalar dependências, aplicar migrações, rodar o seed, subir o servidor, fazer health-check e relatar URL e credenciais.

O usuário final é **leigo técnico**. Ele só quer ver o site funcionando no navegador. Nunca diga "rode tal comando" — execute você mesmo.

> **Ambiente:** Windows + PowerShell. Use PowerShell para tudo — nunca `brew`, `nohup` ou caminhos `/tmp/`.

## Antes de escrever código

Leia [`docs/03-padroes-de-codigo.md`](./docs/03-padroes-de-codigo.md). Em resumo: cada assunto tem **uma fonte única** (regras em `src/lib/game-rules.ts`, cálculo em `src/lib/scoring.ts`, cores de escudo em `src/lib/tiers.ts`, datas em `src/lib/format.ts`...). Reaproveite; nunca copie lógica ou constante para outro arquivo.

---

## Credenciais e acesso

- **URL local:** `http://gamificacaogarcezconsultoria.local:3000`
- **PostgreSQL:** `postgresql://postgres:postgres@localhost:5432/movimento_em_jogo`
- **Senha padrão dos usuários:** `movimento2026`
- **Admin:** `garcez@garcez` (Maria Eduarda — **sem** `.com`)
- **Outros usuários do seed:** `luizhenriquegarcez@gmail.com` (Luiz Garcez), `douglas@luizgarcez.com.br` (Douglas), `cleiton@luizgarcez.com.br` (Cleiton), `kellyadrsz1@gmail.com` (Kelly), `milenna@luizgarcez.com.br` (Milenna) — todos `role: USER`

> O `.env` já está configurado e nunca deve ser recriado do zero — `NEXTAUTH_SECRET` não pode mudar (quebra sessões existentes).

---

## Runbook — "rodar o projeto do zero" (Windows)

Execute passo a passo via PowerShell, em ordem:

### 1. Verificar Node.js (≥20)

```powershell
node --version
```

Se falhar: `winget install OpenJS.NodeJS.LTS`.

### 2. Verificar PostgreSQL

```powershell
psql --version
```

Se falhar: instale pelo site postgresql.org. Usuário `postgres`, senha `postgres`. Confirme que o serviço está rodando (`services.msc` → "postgresql").

### 3. Garantir o banco `movimento_em_jogo`

```powershell
psql -h localhost -U postgres -c "CREATE DATABASE movimento_em_jogo;" 2>$null
```

Se pedir senha, é `postgres`.

### 4. Verificar o `.env`

O arquivo `.env` já existe. **Não recrie nem altere o `NEXTAUTH_SECRET`.** Se não existir, crie com:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movimento_em_jogo"
NEXTAUTH_SECRET="KpJ4SFCSlHFn5ZQ3bgUa7uRSEvx0ngWO/fILTAKPQDs="
NEXTAUTH_URL="http://gamificacaogarcezconsultoria.local:3000"
UPLOADS_DIR="./uploads"
SEED_PASSWORD="movimento2026"
```

### 5. Instalar dependências, aplicar migrações e seed

```powershell
npm install
npm run db:deploy
npm run db:seed
```

### 6. Subir o servidor

O usuário pode usar o `iniciar-servidor.bat` (duplo clique) ou:

```powershell
npm run dev
```

Porta 3000. Se estiver ocupada (ex.: outro projeto rodando), use outra porta e sobrescreva a URL: `$env:NEXTAUTH_URL="http://localhost:3005"; npx next dev -p 3005`.

### 7. Health-check

```powershell
Invoke-WebRequest -Uri "http://gamificacaogarcezconsultoria.local:3000/login" -UseBasicParsing | Select-Object StatusCode
```

StatusCode 200 → ok.

> **Se o domínio não resolver:** o arquivo `C:\Windows\System32\drivers\etc\hosts` precisa ter `127.0.0.1 gamificacaogarcezconsultoria.local` (requer administrador).

### 8. Reportar ao usuário

Avise que o site está aberto na URL e passe o login padrão (`garcez@garcez` / `movimento2026`).

---

## Troubleshooting que o Claude deve resolver sozinho

- **`db:deploy` falha com P3005 ("database schema is not empty"):** banco criado antes da adoção de migrações. Registre a migração inicial como já aplicada e repita: `npx prisma migrate resolve --applied 0_init` → `npm run db:deploy`.
- **Mudou o `schema.prisma`:** `npm run db:migrate -- --name descricao_da_mudanca` (gera e aplica a migração), depois apague `.next` e reinicie. Leia antes [`docs/04-banco-de-dados.md`](./docs/04-banco-de-dados.md): mudar tipo de coluna exige migração escrita à mão.
- **Erro "Nenhum desafio ativo no banco":** `npm run db:seed`.
- **Login falha com "Credenciais inválidas":** confira se `NEXTAUTH_URL` bate com a URL/porta real. Ajuste e reinicie.
- **Upload retorna erro:** confirme que `./uploads/` existe e tem permissão de escrita. Só imagens (JPG, PNG, WEBP, GIF, HEIC) são aceitas.
- **DB vazio / sem usuários:** `npm run db:seed` (idempotente: só cria o que falta).
- **Erro de tipos com `.next/types` após apagar uma rota:** apague a pasta `.next`.

---

## Testes

```powershell
npm test                 # unitários (Vitest) — regras de pontuação
node tests/e2e.mjs       # ponta a ponta (Playwright); servidor rodando; $env:BASE_URL se não for :3000
```

O teste ponta a ponta cria um agente de teste e o remove ao final. Screenshots em `tests/screenshots/` (fora do git).

---

## O que NUNCA fazer

- Nunca peça ao usuário para rodar `npm install`, `prisma ...`, `psql ...` — **execute você mesmo**.
- Não suba em produção sem a pessoa pedir.
- Não apague o banco sem confirmação.
- Não commite `.env`.
- Não altere `NEXTAUTH_SECRET` (quebra sessões existentes).
- Não use `prisma db push` — o projeto usa migrações versionadas (`db:migrate` / `db:deploy`).
- Não use comandos macOS (`brew`, `nohup`, `/tmp/`) — o ambiente é Windows.

---

## Deploy em Coolify

Ver [`docs/05-deploy-e-seguranca.md`](./docs/05-deploy-e-seguranca.md). Resumo: o `Dockerfile` da raiz gera a imagem; o `docker-entrypoint.sh` aplica as migrações pendentes, roda o seed e sobe o servidor. Variáveis: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UPLOADS_DIR=/data/uploads` (volume persistente).
