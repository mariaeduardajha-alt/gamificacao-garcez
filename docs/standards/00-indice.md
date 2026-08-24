# 00 — Índice · Base de Conhecimento Movimento em Jogo

> **Projeto:** Movimento em Jogo (também chamado de "Projeto POT") — plataforma de gamificação da equipe **Garcez Consultoria**.
> **Stack real:** Next.js 15 (App Router) + TypeScript, um único repositório fullstack, Prisma + PostgreSQL, NextAuth v4, Tailwind CSS.

Este não é um índice seco. É um roteador: você se identifica na situação abaixo e vai direto para o arquivo certo. Não precisa ler tudo em ordem — mas se é seu primeiro dia, comece pelo 01.

Antes de tudo: se você está aqui para **fazer o Claude Code rodar o projeto** (instalar, subir servidor, resolver erro do dia a dia), o arquivo certo é o **[`CLAUDE.md`](../../CLAUDE.md)** na raiz do repositório — ele é o manual operacional do agente (runbook Windows, credenciais, troubleshooting, comandos). Esta pasta (`docs/standards/`) é o guia de **padrões de código e arquitetura** para quem vai programar no projeto, seja pessoa ou LLM.

---

## Comece aqui

| Sua situação | Vá para |
|---|---|
| "Acabei de entrar no time, nunca vi este projeto" | [`01-onboarding.md`](./01-onboarding.md) — setup do ambiente, glossário, filosofia |
| "Preciso entender como o sistema é montado por dentro" | [`02-arquitetura.md`](./02-arquitetura.md) — como as peças se conectam, fluxo de uma request |
| "Estou criando/nomeando um arquivo e não sei o padrão" | [`03-nomenclatura-e-padroes.md`](./03-nomenclatura-e-padroes.md) — tabelas certo/errado, cheat sheet |
| "Estou criando ou mexendo numa rota de API" | [`04-rotas-de-api.md`](./04-rotas-de-api.md) — `route.ts`, `lib/`, padrão de uma feature completa |
| "Estou mexendo em página, componente ou UI" | [`05-frontend.md`](./05-frontend.md) — Server/Client Components, estrutura de pastas, design system |
| "Preciso entender ou proteger login/sessão" | [`07-autenticacao.md`](./07-autenticacao.md) — NextAuth v4 ponta a ponta, middleware, RBAC |
| "Estou criando ou consumindo um endpoint" | [`08-api.md`](./08-api.md) — convenções de resposta, status codes, upload |
| "Estou mexendo no schema do banco / Prisma" | [`06-banco-de-dados.md`](./06-banco-de-dados.md) — modelos reais, migrations, queries |
| "Preciso commitar ou abrir um PR" | [`09-git-workflow.md`](./09-git-workflow.md) — branches, commits, `.gitignore` |
| "Preciso mexer em deploy / Docker / Coolify" | [`10-devops.md`](./10-devops.md) — Dockerfile real, variáveis de ambiente, deploy |
| "Quero revisar segurança antes de subir algo" | [`11-seguranca.md`](./11-seguranca.md) — o que já existe, o que falta, checklist |
| "Quero pedir algo pra LLM e fazer certo" | [`12-guia-vibecoding.md`](./12-guia-vibecoding.md) — prompts prontos, anti-patterns, checklists |
| "Sou uma LLM recebendo isso como contexto" | [`99-referencia-completa.md`](./99-referencia-completa.md) — tudo consolidado num arquivo único |

---

## Mapa completo dos arquivos

```
docs/standards/
├── 00-indice.md                    # este arquivo — mapa de navegação
├── 01-onboarding.md                # boas-vindas, glossário, setup, primeiro dia
├── 02-arquitetura.md               # visão geral, diagrama, fluxo de uma request
├── 03-nomenclatura-e-padroes.md    # regras de nomes: arquivos, variáveis, API, git, banco
├── 04-rotas-de-api.md              # padrão de rota Next.js (route.ts) — substitui "backend" separado
├── 05-frontend.md                  # Server/Client Components, estrutura de pastas, design system
├── 06-banco-de-dados.md            # Prisma + PostgreSQL: schema real, migrations, queries
├── 07-autenticacao.md              # NextAuth v4, middleware, RBAC
├── 08-api.md                       # convenções de API REST, upload, status codes
├── 09-git-workflow.md              # branches, commits, PRs, .gitignore
├── 10-devops.md                    # Docker, variáveis de ambiente, deploy no Coolify
├── 11-seguranca.md                 # segurança aplicada ao stack real, o que falta
├── 12-guia-vibecoding.md           # como usar LLM certo neste projeto
└── 99-referencia-completa.md       # tudo consolidado, otimizado para contexto de LLM
```

---

## Por que este guia é diferente do que você talvez já tenha visto

Se você já trabalhou com um time que tem backend e frontend em repositórios separados (NestJS + Next.js, por exemplo), **esqueça essa mentalidade aqui**. O Movimento em Jogo é:

- **Um único repositório Next.js 15** (App Router) fullstack — não existe "o backend" e "o frontend" como projetos separados, existe `src/app/api/*/route.ts` (rotas de API) e `src/app/**/page.tsx` (páginas), lado a lado no mesmo projeto.
- **Sem NestJS.** Não existe Controller/Service/Repository/Module/Guard/Pipe. Uma rota de API é uma função exportada de um `route.ts`.
- **Sem React Query, Zustand, React Hook Form, Axios ou shadcn/ui.** O frontend usa `fetch` nativo, estado local do React, formulários HTML simples e um design system Tailwind próprio (tema "Valorant/tático").
- **Sem testes unitários hoje.** Existe um único script de teste end-to-end com Playwright (`tests/e2e.mjs`). Isso está documentado honestamente nos arquivos relevantes, não escondido.
- **Deploy via Coolify**, não docker-compose + nginx + certbot genérico.

Cada arquivo desta pasta documenta o projeto **como ele realmente é**, e sinaliza claramente quando algo é uma recomendação para o futuro em vez do estado atual.

---

## Convenção de idioma

Textos explicativos em **português**. Código, nomes de variáveis/funções/arquivos e commits em **inglês** — é a convenção que o próprio código do projeto já segue.

---

## Seu primeiro dia — checklist

1. Ler [`01-onboarding.md`](./01-onboarding.md) inteiro.
2. Fazer o setup do ambiente (ou pedir para o Claude Code fazer — veja `CLAUDE.md`).
3. Ler [`02-arquitetura.md`](./02-arquitetura.md).
4. Deixar [`03-nomenclatura-e-padroes.md`](./03-nomenclatura-e-padroes.md) aberto como referência do dia a dia.
5. Ler [`04-rotas-de-api.md`](./04-rotas-de-api.md) e [`05-frontend.md`](./05-frontend.md), conforme a área que for mexer.
6. Ler [`12-guia-vibecoding.md`](./12-guia-vibecoding.md) antes de pedir a primeira tarefa para uma LLM.
