# 05 — Deploy e segurança

## Como a produção funciona (Coolify)

1. O Coolify constrói a imagem com o `Dockerfile` da raiz (multi-stage: build do Next em modo `standalone` + seed compilado para JS).
2. Ao iniciar, o container executa `docker-entrypoint.sh`:
   - `prisma migrate deploy` aplica as migrações pendentes. Num banco antigo sem histórico (erro P3005), registra o baseline `0_init` uma única vez e tenta de novo;
   - roda o seed;
   - sobe o servidor (`node server.js`).
   Qualquer falha **interrompe o start** e aparece no log do Coolify. Nenhum erro é silenciado.

### Variáveis de ambiente

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão PostgreSQL |
| `NEXTAUTH_SECRET` | Assina as sessões. **Nunca alterar** em produção (desloga todo mundo). |
| `NEXTAUTH_URL` | URL pública do site |
| `UPLOADS_DIR` | `/data/uploads`, montado como **volume persistente** (é a única cópia dos prints) |
| `SEED_PASSWORD` | Senha inicial dos usuários criados pelo seed (padrão `movimento2026`) |

### Checklist antes de publicar

- [ ] `npm run build`, `npm test` e `node tests/e2e.mjs` passando.
- [ ] Se há migração nova: SQL revisado e **backup do banco feito antes** (`pg_dump`). Migrações que removem colunas apagam os dados delas.
- [ ] Nenhum `.env` ou segredo no commit.

## Segurança

### O que existe

| Proteção | Onde |
|---|---|
| Senhas com bcrypt | `api/users`, `lib/auth.ts` |
| Sessão JWT em cookie httpOnly (NextAuth) | `lib/auth.ts` |
| Login obrigatório em todas as páginas | `middleware.ts` + `requireSession` |
| Permissão de admin em páginas e API | `requireAdminSession` / `requireAdmin` |
| Dados pessoais filtrados pelo usuário da sessão | rotas de API e páginas |
| Validação de entrada | zod (`lib/schemas.ts`) |
| Uploads: só imagens, tamanho limitado, servidos só para logados, sem acesso fora da pasta | `lib/storage.ts`, `app/uploads/[...path]` |
| API nunca devolve `passwordHash` | `api/users/[id]` |
| Erros inesperados viram `internal_error` (detalhe só no log do servidor) | `withApiHandler` |

### O que ainda falta (recomendações)

| Lacuna | Risco | Recomendação |
|---|---|---|
| Sem limite de tentativas de login | Força bruta de senha | Rate limit por IP na rota de login |
| Sem cabeçalhos de segurança (CSP, HSTS, X-Frame-Options) | Clickjacking e injeção de conteúdo | `headers()` no `next.config.mjs` |
| Tipo de imagem validado pela extensão, não pelo conteúdo | Arquivo disfarçado de imagem | Validar os bytes iniciais do arquivo |
| Qualquer pessoa logada vê qualquer print, se souber o endereço | Aceitável numa equipe pequena | Checar dono/admin em `/uploads` se a equipe crescer |
| Ao remover um usuário, os prints dele continuam no disco | Arquivos órfãos | Apagar a pasta `uploads/<userId>` junto |
| Backup do banco não automatizado | Perda de dados | `pg_dump` agendado, guardado fora do servidor |
| Sem verificação automática de dependências | Vulnerabilidades conhecidas | `npm audit` periódico ou Dependabot |
