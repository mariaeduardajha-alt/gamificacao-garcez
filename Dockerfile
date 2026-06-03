FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN NODE_ENV=production npm run build

# Compila seed para JS puro (sem ts-node no runner)
RUN npx tsc prisma/seed.ts \
      --module commonjs --target es2017 \
      --esModuleInterop --resolveJsonModule --skipLibCheck \
      --outDir /tmp/seed-dist 2>/dev/null || true

# ── Runner leve ──
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Prisma runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
# Copia todos os arquivos prisma* do .bin (inclui .wasm e outros necessários)
COPY --from=builder /app/node_modules/.bin/prisma* ./node_modules/.bin/

# Seed runtime (só bcryptjs)
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /tmp/seed-dist/seed.js ./prisma/seed.js

EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma db push --skip-generate; node prisma/seed.js 2>/dev/null; node server.js"]
