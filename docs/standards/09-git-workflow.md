# 09 — Git Workflow

---

## 9.1 — O que é Git, rapidinho

Git guarda o histórico de mudanças do código. Cada mudança vira um "commit" — uma foto do projeto naquele momento, com uma mensagem explicando o que mudou. GitHub hospeda o repositório remoto (`origin`) para o time compartilhar esse histórico.

---

## 9.2 — Comandos essenciais do dia a dia

```bash
git status                 # o que mudou desde o último commit
git diff                   # ver as mudanças linha a linha antes de commitar
git add caminho/do/arquivo # marcar arquivo pra entrar no próximo commit
git commit -m "mensagem"   # criar o commit
git log --oneline -10      # ver os últimos 10 commits
git branch                 # ver em qual branch você está / quais existem
git checkout -b feat/nome  # criar e mudar para uma branch nova
git pull                   # trazer mudanças do remoto
git push                   # enviar seus commits pro remoto
git stash                  # guardar mudanças não commitadas de lado, temporariamente
```

---

## 9.3 — Branches

- `main` — branch principal, deployável.
- `feat/descricao-curta` — feature nova.
- `fix/descricao-curta` — correção de bug.
- `chore/descricao-curta` — manutenção (dependências, config, docs).
- `refactor/descricao-curta` — mudança de estrutura sem mudar comportamento.

O histórico atual do projeto foi construído com commits diretos em `main` (é um time pequeno, ainda sem PR obrigatório). **Ao escalar o time**, adotar branch + PR por mudança não-trivial é o padrão recomendado daqui pra frente — ver 9.5.

---

## 9.4 — Conventional Commits

Adotado como padrão para commits novos (ver também `03-nomenclatura-e-padroes.md` §3.7):

```
feat: adiciona filtro por setor na fila de aprovação admin
fix: corrige cálculo de dias ativos quando duração é null
chore: atualiza dependências do Prisma
docs: documenta fluxo de upload em docs/standards/08-api.md
refactor: extrai mapeamento status→cor para src/lib/status.ts
```

Prefixos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`. Corpo do commit em português está OK (é a língua usada no histórico real do projeto); prefixo em inglês por convenção da própria especificação Conventional Commits.

---

## 9.5 — Fluxo de uma feature (recomendado ao escalar o time)

```
main
 └── feat/nova-feature   (branch criada a partir de main)
       commit 1
       commit 2
       commit 3
 └── PR: feat/nova-feature → main
       revisão de outra pessoa
       ajustes se necessário
 └── merge em main
```

Template de PR sugerido:

```markdown
## O que mudou
<!-- resumo objetivo -->

## Por quê
<!-- motivação / issue relacionada -->

## Como testar
<!-- passos manuais, ou "rodei node tests/e2e.mjs e passou" -->

## Checklist
- [ ] `npm run build` passa
- [ ] Rotas afetadas testadas manualmente (sessão, role ADMIN quando aplicável)
- [ ] Sem `.env`/segredo novo commitado
```

---

## 9.6 — `.gitignore` e achado corrigido: `uploads/`

O `.gitignore` do projeto, antes desta revisão, era:

```
node_modules
.next
.env
.env.local
*.tsbuildinfo
next-env.d.ts
.vercel
.DS_Store
```

**Achado real desta auditoria:** a pasta `uploads/` (onde `src/lib/storage.ts` grava os comprovantes de atividade/demanda e fotos de perfil enviados por usuários reais) **não estava** no `.gitignore`, e havia arquivos reais já commitados no histórico do repositório — prints de comprovante enviados por usuários de verdade:

```
uploads/cmpe5iv3h0000njdkogxq0ede/1780251829404-827f665da88b4a2c.png
uploads/cmpe5iv4n0003njdkmbae6sbv/1780250646834-77621b81e7dec5bb.jpeg
uploads/cmpe5iv4n0003njdkmbae6sbv/1780250675640-25ea79b537fccbc9.jpeg
uploads/cmpe5iv4n0003njdkmbae6sbv/1780250701193-ccc8b71ac3967bfa.png
```

Isso é um problema de dois tipos:
1. **Dado de usuário indo pro histórico do Git** (que costuma ser mais amplamente acessível/mais difícil de purgar do que o volume de produção).
2. **Repositório crescendo sem controle** conforme mais uploads acontecem — `uploads/` é justamente o tipo de pasta que deve ficar de fora do versionamento, igual `node_modules` ou `.next`: é conteúdo gerado/enviado em runtime, não código.

**Correção aplicada como parte desta auditoria de documentação:**
- `uploads/` foi adicionado ao `.gitignore` (append, sem remover as entradas existentes).
- Os arquivos já commitados foram **destrackeados** com `git rm --cached -r uploads` — isso **não apaga** os arquivos locais em disco, só faz o Git parar de rastreá-los daqui pra frente. Essa mudança ficou preparada (staged/unstaged) no working tree, **sem commit** — quem revisar decide quando commitar.

**Isso não retira os 4 arquivos do histórico antigo do Git** (commits passados ainda os contêm). Se isso for uma preocupação de privacidade/segurança real (prints de comprovante são dado pessoal de colaboradores), considerar separadamente uma limpeza de histórico (`git filter-repo` ou equivalente) — está fora do escopo desta correção pontual, é uma decisão que exige cuidado extra (reescreve hashes de commit, exige coordenação se houver clones remotos).

Ao configurar Coolify/deploy, lembrar que com `uploads/` fora do Git, o volume persistente (`/data/uploads`, ver `10-devops.md`) é a **única** cópia dos uploads em produção — reforça a importância de ter esse volume realmente persistente e, idealmente, com backup (ver `11-seguranca.md`).

---

## 9.7 — O que nunca commitar

- `.env` (já no `.gitignore` — nunca commitar de qualquer forma, contém `NEXTAUTH_SECRET` e credenciais de banco).
- `uploads/` (corrigido nesta revisão, ver 9.6).
- `node_modules`, `.next`, `*.tsbuildinfo` (já ignorados, são artefatos de build/dependência).
