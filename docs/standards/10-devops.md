# 10 — DevOps

> Docker real do projeto (não docker-compose de dev), variáveis de ambiente, deploy no Coolify.

---

## 10.1 — O que é Docker aqui

Analogia: Docker empacota a aplicação e tudo que ela precisa para rodar (runtime Node, dependências) numa "caixa" (imagem) que roda igual em qualquer lugar. Neste projeto, Docker é usado **só para build/deploy em produção** — o desenvolvimento local roda direto com Node + PostgreSQL nativos (ver `01-onboarding.md` e o runbook em `CLAUDE.md`), não há `docker-compose` para desenvolvimento.

---

## 10.2 — Dockerfile real (multi-stage)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN NODE_ENV=production npm run build

# Gera SQL de migração SEM precisar de banco (from-empty)
RUN npx prisma migrate diff \
      --from-empty \
      --to-schema-datamodel prisma/schema.prisma \
      --script \
      > /tmp/migration.sql 2>/dev/null || true

# Compila seed para JS puro
RUN npx tsc prisma/seed.ts \
      --module commonjs --target es2017 \
      --esModuleInterop --resolveJsonModule --skipLibCheck \
      --outDir /tmp/seed-dist 2>/dev/null || true

# ── Runner ──
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl postgresql-client

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /tmp/migration.sql ./prisma/migration.sql
COPY --from=builder /tmp/seed-dist/seed.js ./prisma/seed.js
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

EXPOSE 3000

# Aplica schema via SQL puro → seed → servidor
CMD ["sh", "-c", "psql $DATABASE_URL -f /app/prisma/migration.sql 2>/dev/null; node /app/prisma/seed.js 2>/dev/null; node server.js"]
```

Pontos a entender:
- **`output: "standalone"`** em `next.config.mjs` é o que permite copiar só `.next/standalone` + `.next/static` + `public` no estágio final, sem levar o `node_modules` inteiro do build (imagem final bem menor).
- O **estágio `builder`** instala tudo, builda o Next, e já pré-gera tanto o SQL de "migration from-empty" quanto o seed compilado para JS puro — o estágio `runner` não tem `tsx`/TypeScript instalado, só o necessário para rodar.
- O `CMD` final aplica o schema via `psql` cru, roda o seed, e só então sobe `node server.js` — os dois primeiros passos silenciam erro (`2>/dev/null`) porque rodam a cada deploy/restart do container, inclusive quando o schema já está aplicado (idempotência aproximada, não garantida). **Este é o mecanismo de migration "atual, sendo substituído"** documentado em detalhe em `06-banco-de-dados.md` §6.3 (Decisão B) — ao adotar `prisma migrate deploy` como novo padrão, este `CMD` e o passo `migrate diff --from-empty` do estágio builder precisarão ser trocados, como parte da tarefa de baseline mencionada lá.

**O que este Dockerfile não tem, e por quê não é um problema hoje:** não há `docker-compose.yml` acompanhando (não há Postgres/Redis/pgAdmin sendo orquestrados — o Postgres de produção é gerenciado separadamente, seja pelo próprio Coolify seja por um serviço externo apontado via `DATABASE_URL`); não há `nginx`/`certbot` no Dockerfile porque o Coolify cuida do reverse proxy e SSL por fora do container da aplicação.

---

## 10.3 — Variáveis de ambiente

Template real (`.env.example`):
```
# Postgres
DATABASE_URL="postgresql://user:pass@localhost:5432/movimento_em_jogo"

# NextAuth — gere com: openssl rand -base64 32
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# Diretório de uploads (no Coolify apontar para volume persistente, ex: /data/uploads)
UPLOADS_DIR="./uploads"

# Senha padrão do seed
SEED_PASSWORD="movimento2026"
```

No Coolify, as mesmas variáveis precisam ser setadas no painel do serviço, com `UPLOADS_DIR=/data/uploads` (não `./uploads` — em produção precisa ser um caminho absoluto dentro de um volume persistente, ver 10.4). **`NEXTAUTH_SECRET` nunca pode mudar depois de definido em produção** — trocar invalida todas as sessões ativas na hora.

---

## 10.4 — Volume persistente para uploads

```
/data/uploads  →  montado como volume persistente no Coolify
```

Os comprovantes de atividade/demanda e avatares de perfil são gravados nesse caminho por `src/lib/storage.ts` (ver `08-api.md` §8.6). Sem volume persistente, um redeploy do container **apaga todos os uploads** — isso não é um risco teórico, é o comportamento padrão de qualquer container sem volume montado. Confirmar que o volume está de fato configurado antes de qualquer deploy de produção é um item do checklist de deploy (10.7).

---

## 10.5 — Deploy no Coolify

Passo a passo real (reproduzido do `CLAUDE.md`, que é a fonte de verdade operacional):

1. Usar o `Dockerfile` já existente na raiz do projeto — Coolify builda a imagem a partir dele.
2. Setar as variáveis: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UPLOADS_DIR=/data/uploads`.
3. Montar volume persistente em `/data/uploads`.
4. O `CMD` do Dockerfile já aplica o schema, roda o seed e sobe o servidor — não há passo manual adicional de migration hoje (ver 10.2 sobre esse mecanismo).

Não existe ambiente de staging formal, nem pipeline de CI/CD automatizado (GitHub Actions ou similar) rodando testes antes do deploy — o deploy é acionado manualmente no Coolify. Isso é um gap real de processo: sem CI, `npm run build` e `node tests/e2e.mjs` precisam ser rodados manualmente antes de cada deploy (ver checklist em `12-guia-vibecoding.md` §12.7).

---

## 10.6 — Health check e backup

- **Health check:** não há endpoint dedicado `/health` ou `/api/health` hoje — o health-check documentado no `CLAUDE.md` é literalmente checar que `/login` responde `200`. Um endpoint `/api/health` que verifica conexão com o banco (`prisma.$queryRaw`SELECT 1`` ou equivalente) é uma melhoria recomendada, não implementada.
- **Backup do PostgreSQL:** **não há estratégia de backup documentada ou automatizada hoje.** Isso é um risco real, não só teórico — dado de produção (atividades, demandas, comprovantes referenciados) sem backup significa que qualquer incidente no banco gerenciado pelo Coolify é potencialmente irrecuperável. Recomendação mínima: `pg_dump` agendado (cron externo ou recurso equivalente do Coolify, se disponível) com rotação de pelo menos alguns dias, apontado para um destino fora do próprio host do banco. Ver também `11-seguranca.md`.

---

## 10.7 — Checklist de deploy

- [ ] `npm run build` passa localmente sem erro.
- [ ] `node tests/e2e.mjs` passa com o dev server no ar.
- [ ] Variáveis de ambiente conferidas no painel do Coolify (`DATABASE_URL`, `NEXTAUTH_SECRET` inalterado, `NEXTAUTH_URL`, `UPLOADS_DIR=/data/uploads`).
- [ ] Volume persistente de `/data/uploads` confirmado montado (não é o padrão de um container novo — precisa ser configurado explicitamente).
- [ ] Se o schema Prisma mudou desde o último deploy: confirmar que o mecanismo de migration atual (`migrate diff --from-empty` + `psql` no `CMD`, ver 10.2) ainda é o que está em uso, ou que a migração para `prisma migrate deploy` (ver `06-banco-de-dados.md` §6.3) já foi feita e o Dockerfile atualizado de acordo — não presumir um ou outro sem checar.
- [ ] `git status` limpo de `.env`/segredo antes de qualquer commit relacionado ao deploy.
