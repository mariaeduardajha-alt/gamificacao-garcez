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

# openssl + postgresql-client (para rodar psql)
RUN apk add --no-cache openssl postgresql-client

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Prisma client (necessário para o app rodar)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# SQL de migração e seed compilado
COPY --from=builder /tmp/migration.sql ./prisma/migration.sql
COPY --from=builder /tmp/seed-dist/seed.js ./prisma/seed.js

# bcryptjs para o seed
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

EXPOSE 3000

# Aplica schema via SQL puro → seed → servidor
CMD ["sh", "-c", "psql $DATABASE_URL -f /app/prisma/migration.sql 2>/dev/null; node /app/prisma/seed.js 2>/dev/null; node server.js"]
