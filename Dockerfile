FROM node:20-slim
WORKDIR /app

# Instala openssl necessário para o Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instala todas as dependências (incluindo devDeps para build e seed)
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install

COPY . .

# Gera o Prisma Client e faz o build de produção
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Roda migrations + seed na inicialização, depois inicia o servidor
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run db:seed; node .next/standalone/server.js"]
