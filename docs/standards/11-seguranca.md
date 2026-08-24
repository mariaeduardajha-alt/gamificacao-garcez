# 11 — Segurança

> O que já existe, o que falta, e o que fazer a respeito. Sinalizado honestamente como estado atual vs. recomendação — nenhum item aqui está implementado só porque está descrito.

---

## 11.1 — O que já existe

| Proteção | Como está implementada |
|---|---|
| **Hash de senha** | `bcryptjs`, `bcrypt.hash(password, 10)` na criação de usuário (`src/app/api/users/route.ts`), `bcrypt.compare` no login (`src/lib/auth.ts`). Nunca senha em texto plano no banco. |
| **Sessão** | JWT via NextAuth v4, assinado com `NEXTAUTH_SECRET`, em cookie httpOnly gerenciado pela lib — não é implementação própria. |
| **Proteção de rota por sessão** | `src/middleware.ts` (`withAuth`) bloqueia qualquer rota fora da lista de exceção sem sessão válida. Ver `07-autenticacao.md` §7.4. |
| **Controle por role (RBAC)** | Checagem manual `session.user.role === "ADMIN"` em cada rota/página administrativa. Ver `07-autenticacao.md` §7.5. |
| **Escopo de dado por usuário** | Toda query de listagem filtra por `userId: session.user.id` — um usuário não consegue ler/apagar dado de outro usuário via essas rotas. |
| **SQL Injection** | Mitigado pelo Prisma, que parametriza queries automaticamente. Nenhuma query usa `$queryRawUnsafe` com concatenação de string hoje. |
| **XSS via JSX** | React escapa conteúdo renderizado via `{variavel}` por padrão. O projeto não usa `dangerouslySetInnerHTML` em nenhum lugar identificado. |
| **Uploads atrás de autenticação** | `/uploads/[...path]` exige sessão antes de servir qualquer arquivo — não é uma pasta pública. |

---

## 11.2 — O que falta (sinalizado como recomendação, não como estado atual)

| Gap | Risco | Recomendação |
|---|---|---|
| **Sem security headers** (CSP, `X-Frame-Options`, `Strict-Transport-Security`, etc.) | Sem essas headers, o navegador não tem instrução extra contra clickjacking, injeção de conteúdo cross-origin, etc. | Adicionar via `headers()` em `next.config.mjs` ou middleware — não é uma mudança grande, mas precisa de teste (CSP mal configurada quebra a página). |
| **Sem rate limiting** no login (`authorize()`) nem em rotas de criação | Login sem limite de tentativas é vulnerável a força bruta de senha, mesmo com bcrypt. Rotas de criação sem limite são vulneráveis a abuso/spam. | Middleware de rate limit (ex.: baseado em IP + janela de tempo) na rota de auth, no mínimo. |
| **Sem CSRF token explícito** | NextAuth v4 com Credentials Provider tem alguma proteção embutida (verificação de origem em parte do fluxo), mas não há CSRF token customizado nas rotas de API própria (`POST /api/activities`, etc.) além do que vem de cookie `SameSite`. | Revisar a configuração de cookie do NextAuth (`sameSite`) e considerar CSRF token explícito se o app algum dia servir conteúdo embeddable/cross-origin. |
| **Validação de mimetype de upload é só por extensão** | Um arquivo malicioso renomeado com extensão de imagem passa pela checagem atual (ver `08-api.md` §8.6). | Validar os magic bytes do arquivo (não só a extensão) antes de gravar, ou usar uma lib dedicada de detecção de tipo. |
| **Sem `npm audit` / verificação de dependência automatizada** | Vulnerabilidades conhecidas em dependências (`next-auth`, `bcryptjs`, etc.) não são pegas automaticamente. | Rodar `npm audit` periodicamente, ou configurar Dependabot/similar no GitHub. |
| **Sem estratégia de backup do banco** | Ver `10-devops.md` §10.6 — dado de produção sem backup é perda potencial irrecuperável em caso de incidente. | `pg_dump` agendado com rotação, destino fora do host do banco. |
| **Limite de tamanho de upload inconsistente e sem constante nomeada** | Não é uma vulnerabilidade por si só, mas facilita erro humano (alguém muda um limite e esquece o outro). | Ver `08-api.md` §8.6 — extrair para constante compartilhada em `storage.ts`. |
| **`try/catch` ausente nas rotas de API** | Uma exceção não tratada do Prisma pode, dependendo da configuração de erro do Next, vazar detalhes internos (stack trace, nome de coluna) numa resposta de erro genérica em vez de um `{ error }` controlado. | Ver `04-rotas-de-api.md` §4.4 — capturar exceção e devolver erro genérico ao client, logando o detalhe só no servidor. |
| **`as any` em `auth.ts`/`next-auth.d.ts`** | Não é uma vulnerabilidade direta, mas tipo incompleto mascarado por `any` é terreno fértil para um bug de autorização passar despercebido em revisão futura. | Ver `07-autenticacao.md` §7.3 — declarar `avatarUrl` corretamente nas interfaces do NextAuth. |

---

## 11.3 — "O que pode dar errado" — cenários concretos

- **Alguém reaproveita a URL de comprovante de outro usuário.** Hoje a proteção é "precisa estar logado" (qualquer sessão válida), não "precisa ser o dono do arquivo ou admin" — a rota `/uploads/[...path]` verifica `auth()` mas não verifica se `session.user.id` corresponde ao `userId` embutido no caminho do arquivo. Na prática, qualquer usuário autenticado pode acessar o comprovante de qualquer outro usuário se souber (ou adivinhar/enumerar) o caminho. Isso é aceitável dentro de uma equipe pequena e de confiança mútua (o cenário de uso real do projeto), mas é uma checagem de autorização ausente que vale a pena documentar explicitamente — não presumir que "logado" implica "autorizado a ver este arquivo específico".
- **Força bruta de senha de um usuário específico.** Sem rate limiting, um script pode tentar centenas de senhas contra `garcez@garcez` (e-mail do admin) sem ser bloqueado — só o custo do `bcrypt.compare` (proposital e configurável) desacelera, não impede.
- **Upload de arquivo grande demais fora do limite documentado.** Como os limites de 8MB/5MB são checados só depois que o `FormData` inteiro já foi parseado no handler, uma request maliciosa consegue consumir memória do processo antes da rejeição — mitigável com um limite de tamanho de request a nível de proxy/Coolify, não só na aplicação.

---

## 11.4 — Checklist de segurança pré-deploy

- [ ] `.env` não commitado, `NEXTAUTH_SECRET` não alterado em produção.
- [ ] Nenhuma rota nova esqueceu a checagem `auth()`/`role === "ADMIN"` onde deveria.
- [ ] Nenhuma query nova retorna dado sem filtrar por `userId` da sessão (ou, para rotas admin, sem checar `role`).
- [ ] Se a mudança envolveu upload, o tamanho e o tipo esperado do arquivo foram checados.
- [ ] `npm audit` rodado e vulnerabilidades críticas revisadas antes de um release maior.
- [ ] Backup recente do banco confirmado antes de qualquer migração de schema em produção.
