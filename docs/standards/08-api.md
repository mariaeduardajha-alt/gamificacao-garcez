# 08 — Padrões de API

> Convenções de resposta, status codes e upload. Sem `/api/v1` — ver `03-nomenclatura-e-padroes.md` §3.6 para o porquê.

---

## 8.1 — O que é REST, rapidamente

Cada recurso (atividade, demanda, usuário) tem uma URL, e o verbo HTTP diz o que fazer com ela:

| Verbo | Analogia | Uso real no projeto |
|---|---|---|
| `GET` | Consultar | `GET /api/activities` — lista minhas atividades |
| `POST` | Criar (ou executar uma ação) | `POST /api/activities` — cria atividade; `POST /api/activities/[id]/review` — aprova/rejeita |
| `PATCH` | Editar parcialmente | `PATCH /api/users/[id]` — edita agente |
| `DELETE` | Remover | `DELETE /api/activities` — apaga todas as minhas; `DELETE /api/users/[id]` — remove agente |

---

## 8.2 — Mapeamento real de endpoints

| Rota | Método | Quem acessa | Função |
|---|---|---|---|
| `/api/activities` | GET | logado | lista as atividades do próprio usuário |
| `/api/activities` | POST | logado | cria atividade (multipart, com comprovante opcional) |
| `/api/activities` | DELETE | logado | apaga todas as atividades do próprio usuário |
| `/api/activities/[id]/review` | POST | ADMIN | aprova/rejeita uma atividade |
| `/api/demands` | GET | logado | lista as demandas do próprio usuário |
| `/api/demands` | POST | logado | cria demanda (multipart, com comprovante opcional) |
| `/api/demands/[id]/review` | POST | ADMIN | aprova/rejeita uma demanda |
| `/api/users` | GET | ADMIN | lista todos os agentes |
| `/api/users` | POST | ADMIN | cria agente novo |
| `/api/users/[id]` | PATCH/DELETE | ADMIN | edita/remove agente |
| `/api/profile` | POST | logado | atualiza foto de perfil (avatar) |
| `/api/profile` | DELETE | logado | remove foto de perfil |
| `/api/auth/[...nextauth]` | GET/POST | público | login/logout (gerenciado pelo NextAuth) |
| `/uploads/[...path]` | GET | logado | serve o arquivo de comprovante/avatar (fora de `/api`) |

---

## 8.3 — Formato de resposta: o que existe hoje

**Sucesso**, hoje, varia por rota — não há um envelope único imposto:
```json
// GET /api/activities
{ "items": [ { "id": "...", "date": "...", "type": "CORRIDA", "...": "..." } ] }

// POST /api/activities
{ "ok": true, "id": "cl...", "dayPointsGained": 10, "bonusGained": 0 }

// GET /api/users
{ "users": [ { "id": "...", "name": "...", "...": "..." } ] }
```

**Erro**, por convenção (não garantido estruturalmente — ver `04-rotas-de-api.md` §4.4 sobre a ausência de `try/catch`):
```json
{ "error": "unauthorized" }
```

Com o código HTTP correspondente ao motivo:

| Código no `error` | Status HTTP | Quando |
|---|---|---|
| `unauthorized` | 401 | sem sessão |
| `forbidden` | 403 | sessão existe, mas sem role ADMIN necessária |
| `invalid_input` | 400 | campo obrigatório ausente ou inválido |
| `invalid_action` | 400 | valor de ação fora do enum esperado (ex.: `action` diferente de `APPROVE`/`REJECT`) |
| `not_found` | 404 | recurso não existe |
| `file_too_large` | 400/413 | arquivo de upload maior que o limite (hoje inconsistente — ver 8.6) |
| `email_taken` | 409 | e-mail já cadastrado, ao criar agente |

**Recomendação nova (não bloqueante, adoção oportunista):** ao criar rotas novas — ou ao tocar em rotas antigas por outro motivo — considerar padronizar num envelope único `{ data }` / `{ error, status }`, e um helper central que garanta que qualquer exceção não tratada também caia nesse formato (em vez de virar 500 cru do Next). Isso **não é o padrão atual em produção** e não deve ser aplicado retroativamente a rotas que não estão sendo tocadas, só para não gerar uma migração grande e arriscada sem necessidade — ver `12-guia-vibecoding.md` para como propor essa mudança de forma incremental.

---

## 8.4 — Status codes usados

| Código | Uso real no projeto |
|---|---|
| `200` | sucesso padrão (GET, POST de ação, PATCH, DELETE) |
| `400` | input inválido |
| `401` | sem sessão |
| `403` | sem permissão (role) |
| `404` | usado pela rota de uploads quando o arquivo não existe |
| `409` | conflito (e-mail já cadastrado) |
| `500` | não emitido deliberadamente por nenhuma rota — é o que o Next devolve quando uma exceção não tratada escapa (ver 8.3) |

O projeto não usa `201 Created` para criação (as rotas de criação devolvem `200` com `{ ok: true, id }`), nem `204 No Content` para deleção (devolvem `200` com um corpo). Não é a convenção HTTP "livro-texto", mas é a convenção **real e consistente** do projeto — siga-a em rotas novas, em vez de misturar `201`/`204` pontualmente.

---

## 8.5 — Paginação, filtros, ordenação

**Não implementado hoje.** Todas as listagens (`GET /api/activities`, `GET /api/demands`, `GET /api/users`) devolvem a lista inteira do escopo do usuário/tabela, sem `limit`/`offset`/`cursor`. Isso é viável no volume atual do projeto (equipe pequena, período de desafio limitado), mas é um ponto de atenção se o volume de dados crescer — se for necessário adicionar paginação no futuro, offset-based (`?page=`, `?perPage=`) é a recomendação mais simples de introduzir sem redesenhar o contrato de resposta.

---

## 8.6 — Upload de arquivo

Uploads (comprovante de atividade/demanda, avatar de perfil) usam `multipart/form-data`, nunca base64 em JSON. A gravação em disco é feita por `src/lib/storage.ts`:

```ts
// src/lib/storage.ts — real, completo
const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), "uploads");
const PUBLIC_PATH = "/uploads";

export async function saveProof(userId: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const id = randomBytes(8).toString("hex");
  const rel = `${userId}/${Date.now()}-${id}.${ext}`;
  const abs = join(UPLOADS_DIR, rel);
  await mkdir(dirname(abs), { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, buf);
  return `${PUBLIC_PATH}/${rel}`;
}
```

A leitura é servida por uma rota protegida própria (não é um `public/` estático — arquivos de usuário exigem sessão para ver):

```ts
// src/app/uploads/[...path]/route.ts — trecho real
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session) return new Response("unauthorized", { status: 401 });
  // ... resolve o caminho, verifica que o arquivo existe, devolve com content-type correto
}
```

**Limite de tamanho — achado real, não corrigido ainda:** o limite é checado manualmente em cada rota que recebe upload, e **não é consistente**:
- `activities/route.ts` e `demands/route.ts`: `file.size > 8 * 1024 * 1024` (8MB), escrito como número mágico em cada arquivo (duplicado 2×).
- `profile/route.ts` (avatar): `file.size > 5 * 1024 * 1024` (5MB), um terceiro valor, também não nomeado.

Nenhum desses limites vive como constante nomeada e compartilhada, apesar de `storage.ts` já existir e ser o lugar óbvio para isso (`MAX_PROOF_SIZE_BYTES`, `MAX_AVATAR_SIZE_BYTES`, por exemplo). Ao tocar em qualquer uma dessas três rotas, considerar extrair a constante em vez de copiar o número mágico mais uma vez.

**Validação de mimetype:** a rota de upload valida a extensão só para decidir o `content-type` da resposta (mapa `MIME` em `uploads/[...path]/route.ts`), não valida o conteúdo real do arquivo enviado no `POST` — isto é, um arquivo renomeado com extensão de imagem mas conteúdo diferente não é rejeitado hoje. É um gap de segurança sinalizado em `11-seguranca.md`, não uma proteção existente.

---

## 8.7 — Exemplo de chamada do client

```ts
// client component — envio de atividade com comprovante
const form = new FormData();
form.append("date", date);
form.append("type", type);
form.append("durationMin", String(durationMin));
if (file) form.append("proof", file);

const res = await fetch("/api/activities", { method: "POST", body: form });
if (!res.ok) {
  const { error } = await res.json().catch(() => ({ error: "erro desconhecido" }));
  // tratar erro — ver 05-frontend.md sobre o gap de erros silenciados em algumas telas
}
```
