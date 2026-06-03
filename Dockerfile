FROM node:20-alpine AS builder
WORKDIR /app

# Força instalação de devDependencies necessárias para o build
ENV NODE_ENV=development

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN NODE_ENV=production npm run build

# ── Imagem final leve ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copia o servidor standalone + arquivos estáticos + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["node", "server.js"]
