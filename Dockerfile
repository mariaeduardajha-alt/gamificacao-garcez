FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

# Instala também as devDependencies (necessárias para o build e para compilar o seed)
COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npx prisma generate
RUN NODE_ENV=production npm run build

# Compila o seed para JS puro (o runner não tem TypeScript)
RUN npx tsc prisma/seed.ts \
      --module commonjs --target es2017 \
      --esModuleInterop --resolveJsonModule --skipLibCheck \
      --outDir /tmp/seed-dist

# ── Runner ──
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Schema + migrações versionadas (aplicadas pelo entrypoint com `prisma migrate deploy`)
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder /app/prisma/migrations ./prisma/migrations
COPY --from=builder /tmp/seed-dist/seed.js ./prisma/seed.js

# Prisma: client gerado + CLI (mesma versão do package-lock) para rodar as migrações
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# bcryptjs para o seed
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
