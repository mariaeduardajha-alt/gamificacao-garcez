# 04 — Banco de dados

> PostgreSQL + Prisma. Schema em `prisma/schema.prisma`, histórico em `prisma/migrations/`.

## Modelos

| Model | Função | Observações |
|---|---|---|
| `User` | Agente | `role` (USER/ADMIN), `sector`, `avatarUrl`. Ao ser removido, apaga em cascata suas atividades e demandas. |
| `Activity` | Exercício | `date` (meio-dia UTC), `type`, `durationMin`, `proofUrl`, `status`. Criado sempre como `APPROVED`. |
| `Demand` | Demanda de trabalho | `weight` → `points`, `completedAt` (meio-dia UTC), `status` (nasce `PENDING`), `reviewedBy/At/Note`. |
| `Challenge` | Desafio ativo | Período e limiares coletivos de dias ativos (`bronze/silver/goldActiveDays`). Criado pelo seed. |
| `SectorGoal` | Meta de um setor | `current`, `bronze/silver/gold`, `unit`, `direction` (HIGHER/LOWER_IS_BETTER). Ainda sem tela de edição. |

Enums: `Role`, `ReviewStatus` (PENDING/APPROVED/REJECTED, usado por Activity e Demand), `ActivityType`, `DemandWeight`, `GoalDirection`.

## Migrações — fluxo oficial

| Situação | Comando |
|---|---|
| Mudei o `schema.prisma` (local) | `npm run db:migrate -- --name descricao_da_mudanca` → gera `prisma/migrations/<data>_<nome>/migration.sql` e aplica no banco local |
| Aplicar migrações pendentes (local ou produção) | `npm run db:deploy` (em produção é automático, no `docker-entrypoint.sh`) |
| Banco antigo, criado antes das migrações (erro P3005) | `npx prisma migrate resolve --applied 0_init` e depois `npm run db:deploy` |

**Sempre revise o SQL gerado antes de commitar.** O Prisma **apaga e recria** a coluna quando o tipo dela muda (enum novo, troca de tipo, renomear campo), e isso perde os dados. Nesses casos, escreva a migração à mão, convertendo com `ALTER COLUMN ... TYPE ... USING ...`. Exemplo real: `20261007000000_remove_campos_legados_e_unifica_status`.

Para gerar uma migração vazia e escrever o SQL você mesmo: `npx prisma migrate dev --create-only --name descricao`.

Nunca use `prisma db push`: ele altera o banco sem deixar histórico, e a produção ficaria diferente do repositório.

## Seed (`prisma/seed.ts`)

Roda a cada deploy. Com os usuários, só **cria** o que falta: nome, cargo e foto editados não são sobrescritos. O desafio é criado e **tem datas e limiares regravados** a cada execução (ver `02-regras-do-jogo.md`). As metas dos setores são só criadas.

## Convenções

- Model em PascalCase singular, campo em camelCase, valor de enum em UPPER_SNAKE_CASE.
- Índice (`@@index`) nas colunas usadas em filtro frequente (ex.: `Activity [userId, date]`).
- **Decisão pendente do time:** expor nomes `snake_case` no banco com `@@map`/`@map`. Não foi aplicado. Não adicione `@map` em models isolados; isso só deve ser feito em todos de uma vez, numa migração planejada.
