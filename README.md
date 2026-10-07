# Movimento em Jogo

Plataforma de gamificação da equipe **Garcez Consultoria**: cada pessoa registra seus exercícios e demandas de trabalho, o sistema calcula pontos, ranking e escudos (bronze/prata/ouro), e a equipe persegue uma meta coletiva. Identidade visual tática, estilo Valorant.

**Stack:** Next.js 15 (App Router, front e API no mesmo projeto) · TypeScript · Prisma + PostgreSQL · NextAuth v4 · Tailwind · Vitest (unitários) · Playwright (ponta a ponta).

---

## Para quem não é técnico

Abra o **Claude Code** nesta pasta e diga **"inicia o projeto"**. Ele instala, sobe o banco e o servidor sozinho e devolve o link. Login inicial: `garcez@garcez` / `movimento2026`.

## Para quem é técnico

```bash
npm install
npm run db:deploy    # aplica as migrações em prisma/migrations
npm run db:seed      # equipe, desafio e metas dos setores (idempotente)
npm run dev
```

Pré-requisitos: Node ≥ 20, PostgreSQL e um `.env` (modelo em `.env.example`). O passo a passo para Windows está no [`CLAUDE.md`](./CLAUDE.md).

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | `prisma generate` + build de produção |
| `npm test` | Testes unitários (Vitest) das regras de pontuação |
| `node tests/e2e.mjs` | Teste ponta a ponta (precisa do servidor rodando; `BASE_URL` opcional) |
| `npm run db:migrate` | Cria migração nova após mudar o `schema.prisma` |
| `npm run db:deploy` | Aplica migrações pendentes |
| `npm run db:seed` | Popula dados iniciais |
| `npm run db:studio` | Interface visual do banco |

---

## Mapa da pasta

```
├── CLAUDE.md                 manual operacional para o Claude Code (rodar, credenciais, problemas comuns)
├── Dockerfile                imagem de produção (Coolify)
├── docker-entrypoint.sh      no container: aplica migrações → seed → sobe o servidor
├── iniciar-servidor.bat      atalho Windows: duplo clique sobe o servidor de dev
├── docs/                     documentação (ver índice abaixo) + PROJETO-POT.pdf (documento do projeto)
├── prisma/
│   ├── schema.prisma         modelos do banco
│   ├── migrations/           histórico versionado de mudanças no banco
│   └── seed.ts               equipe, desafio e metas iniciais
├── public/                   logo, favicon e fotos iniciais da equipe
├── tests/e2e.mjs             teste ponta a ponta (Playwright)
└── src/
    ├── middleware.ts         exige login em todas as páginas (exceto /login)
    ├── app/                  PÁGINAS e ROTAS DE API (cada pasta = uma URL)
    │   ├── page.tsx              /                 HUB: meta coletiva, pódio e ranking
    │   ├── login/                /login
    │   ├── registrar/            /registrar        registrar exercício
    │   ├── minhas/               /minhas           histórico de exercícios
    │   ├── demandas/             /demandas e /demandas/nova
    │   ├── meta-dos-setores/     /meta-dos-setores
    │   ├── admin/                /admin (validação de demandas, histórico, engajamento) e /admin/usuarios
    │   ├── uploads/[...path]/    serve os prints enviados (só para logados)
    │   └── api/                  rotas de API (activities, demands, users, profile, auth)
    ├── components/           componentes visuais reutilizáveis (escudos, ranking, avatar, navbar...)
    ├── hooks/                hooks React (envio para a API, clique fora)
    ├── lib/                  REGRAS E SERVIÇOS — ver tabela abaixo
    └── types/                tipos compartilhados
```

### `src/lib/` — onde fica cada regra (uma fonte única para cada assunto)

| Arquivo | Responsável por |
|---|---|
| `game-rules.ts` | **Regras do jogo**: pontos por dia, mínimo de minutos, meta semanal, bônus, tipos de exercício, pesos de demanda |
| `scoring.ts` | Cálculo: dias ativos, pontos, escudos, ranking e desempate |
| `challenge.ts` | `buildSnapshot()`: busca tudo do banco e monta os dados do HUB, setores e admin |
| `tiers.ts` | Cores, nomes e tons dos escudos |
| `format.ts` | Datas e nomes (iniciais, primeiro nome) |
| `status.ts` | Rótulo/cor de Pendente / Aprovada / Rejeitada |
| `schemas.ts` | Validação (zod) dos dados recebidos pela API |
| `auth.ts` / `api-auth.ts` | Login, sessão e checagem de permissão (páginas e API) |
| `api-response.ts` / `error-messages.ts` | Formato de resposta/erro da API e mensagens ao usuário |
| `storage.ts` | Upload de imagens (tipos aceitos, tamanhos, pasta) |
| `review.ts` | Campos gravados quando o admin aprova/rejeita |
| `audio.ts` | Sons de pontuação/conquista (compatível com celular) |
| `prisma.ts` | Conexão com o banco |

---

## Documentação

| Documento | Quando ler |
|---|---|
| [`docs/01-arquitetura.md`](./docs/01-arquitetura.md) | Entender como as peças se conectam |
| [`docs/02-regras-do-jogo.md`](./docs/02-regras-do-jogo.md) | Pontuação, escudos, metas e demandas |
| [`docs/03-padroes-de-codigo.md`](./docs/03-padroes-de-codigo.md) | Antes de escrever código (inclui guia para uso de IA) |
| [`docs/04-banco-de-dados.md`](./docs/04-banco-de-dados.md) | Mexer no schema / migrações |
| [`docs/05-deploy-e-seguranca.md`](./docs/05-deploy-e-seguranca.md) | Publicar, variáveis de ambiente, segurança |
