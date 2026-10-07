#!/bin/sh
# Inicialização do container: aplica migrações pendentes → roda o seed → sobe o servidor.
# Qualquer falha interrompe o start (set -e) — erro de banco aparece no log do Coolify
# em vez de ser silenciado.
set -e

PRISMA="node node_modules/prisma/build/index.js"

# Bancos criados antes da adoção de migrações (pelo antigo script "from-empty" via psql)
# já têm as tabelas, mas não o histórico do Prisma — o deploy falha com P3005.
# Nesse caso, marca a migração 0_init como já aplicada (baseline) e tenta de novo.
# Isso só acontece uma vez: depois o histórico passa a existir.
if ! $PRISMA migrate deploy 2> /tmp/migrate.err; then
  if grep -q "P3005" /tmp/migrate.err; then
    echo "[entrypoint] banco existente sem histórico de migrações — registrando baseline 0_init"
    $PRISMA migrate resolve --applied 0_init
    $PRISMA migrate deploy
  else
    cat /tmp/migrate.err >&2
    exit 1
  fi
fi

# Seed idempotente: só cria o que não existe (não sobrescreve dados editados).
node prisma/seed.js

exec node server.js
