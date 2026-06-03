FROM node:20-alpine AS builder
WORKDIR /app

# Instala openssl + devDeps para o build funcionar
RUN apk add --no-cache openssl
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN NODE_ENV=production npm run build

# ── Runner leve ──
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Standalone server + assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Prisma client + CLI para rodar migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# bcryptjs e ts-node para rodar o seed
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/ts-node ./node_modules/ts-node
COPY --from=builder /app/node_modules/typescript ./node_modules/typescript
COPY --from=builder /app/node_modules/@types ./node_modules/@types
COPY --from=builder /app/node_modules/tsconfig-paths ./node_modules/tsconfig-paths

EXPOSE 3000

# Migrations → seed → servidor
CMD ["sh", "-c", "./node_modules/.bin/prisma db push --skip-generate; ./node_modules/.bin/ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts 2>/dev/null; node server.js"]
