# Movimento em Jogo

Plataforma de gamificação da equipe Garcez Consultoria — identidade visual tática estilo Valorant.

**Regras:** 01/mai — 30/jun · equipe Garcez · meta coletiva 24k/30k/34k kcal (bronze/prata/ouro) + meta de produtividade 300/600/900 pts (demandas ClickUp).

---

## Pra quem não é técnico

Você não precisa rodar nenhum comando. Abra o **Claude Code** dentro desta pasta e diga:

> **"inicia o projeto"**

O Claude vai cuidar de tudo: instalar programas, subir o banco de dados, iniciar o servidor e te passar o link pra abrir no navegador.

Credenciais iniciais:
- **Login admin:** `garcez@garcez.com`
- **Senha:** `movimento2026`

Outros usuários do seed: `adv1@`, `adv2@`, `contador@`, `assistente@`, `estagio@` — todos com a mesma senha.

Se o Claude encontrar algum problema (porta ocupada, banco não iniciou, etc.) ele vai resolver sozinho. Se precisar de ajuda, é só descrever o sintoma ("não abre", "login não funciona", "quero trocar a senha do fulano") e ele conserta.

---

## Pra quem é técnico

Ver `CLAUDE.md` — tem o runbook completo, stack, rotas, troubleshooting e guia de deploy no Coolify.

Stack resumida: Next.js 15 · Prisma · Postgres · NextAuth · Tailwind · upload local em filesystem · Playwright pra E2E.

```bash
npm install
npx prisma db push && npm run db:seed
npm run dev
```

Testes: `node tests/e2e.mjs` (dev rodando).
