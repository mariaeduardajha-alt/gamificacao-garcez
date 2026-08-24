# 05 — Frontend

> Guia do frontend Next.js 15 (App Router) real do projeto. Sem React Query, Zustand, React Hook Form, Axios ou shadcn/ui — o padrão real usa `fetch` nativo, estado local do React, e um design system Tailwind próprio.

---

## 5.1 — O que é o App Router e por que ele muda o jeito de pensar frontend

No Pages Router (Next.js antigo) ou numa SPA React comum, toda página é um Client Component por padrão — busca dado no `useEffect` ou por uma lib de data-fetching. No **App Router**, o padrão é o oposto: **todo componente é Server Component por padrão**, e só vira Client Component quando você explicitamente escreve `"use client"` no topo do arquivo.

Analogia: Server Component é "cozinhar na cozinha do restaurante" — o cliente (browser) nunca vê o processo, só recebe o prato pronto (HTML já renderizado, sem o JS da lógica de busca de dado indo pro bundle do client). Client Component é "cozinhar na mesa do cliente" — precisa mandar os ingredientes (JS) pro browser porque a interação (clique, estado) acontece lá.

---

## 5.2 — Estrutura de pastas real

```
src/
├── app/
│   ├── layout.tsx                # layout raiz (fontes, <html>, providers)
│   ├── page.tsx                  # HUB — Server Component, busca via buildSnapshot()
│   ├── providers.tsx             # client component com providers globais (SessionProvider)
│   ├── login/page.tsx
│   ├── registrar/page.tsx        # form de nova atividade
│   ├── minhas/page.tsx           # Server Component + <MinhasTable> (client)
│   ├── demandas/page.tsx
│   ├── demandas/nova/page.tsx
│   ├── meta-dos-setores/page.tsx
│   ├── admin/
│   │   ├── page.tsx              # Server Component, busca fila de pendências
│   │   ├── AdminList.tsx         # "use client" — lista de aprovação de atividades
│   │   ├── DemandsReviewList.tsx # "use client" — lista de aprovação de demandas
│   │   ├── AllActivitiesHistory.tsx
│   │   ├── EngagementCard.tsx
│   │   └── usuarios/
│   │       ├── page.tsx
│   │       └── UsersManager.tsx  # "use client" — CRUD de agentes
│   └── uploads/[...path]/route.ts
└── components/                    # componentes compartilhados entre páginas
    ├── Navbar.tsx, ProfileMenu.tsx, PlayerAvatar.tsx
    ├── PodiumShield.tsx, MedalGauge.tsx, MedalAchievement.tsx, Shield.tsx, OrnamentalShield.tsx
    ├── StatusBadge.tsx, ProgressBar.tsx, Ranking.tsx, SectorGoalCard.tsx
    ├── MinhasTable.tsx, ActivityActions.tsx, DeleteAllActivities.tsx
    ├── ScoreAnimation.tsx, BonusSound.tsx
```

Não existe uma pasta `features/{feature}/` nem `components/ui/` (não há shadcn instalado). A separação real observada no projeto é: **componente usado só numa página → definido no próprio arquivo da página ou numa pasta ao lado dela** (ex.: `AdminList.tsx` vive dentro de `src/app/admin/`, ao lado do `page.tsx` que o usa); **componente usado em 2+ páginas → `src/components/`**.

---

## 5.3 — Server Component ou Client Component?

```
Este componente precisa de useState / useEffect / onClick / onChange /
qualquer hook, OU precisa rodar algo só disponível no browser (Web Audio,
localStorage, etc.)?
   SIM → "use client" no topo do arquivo
   NÃO → não escreva nada — é Server Component por padrão
```

**Exemplo real de Server Component** (`src/app/page.tsx`, simplificado):
```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildSnapshot } from "@/lib/challenge";
import { rankWithTies } from "@/lib/scoring";

export const dynamic = "force-dynamic"; // sempre busca dado fresco, sem cache estático

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const s = await buildSnapshot();       // busca DIRETO no Prisma, sem passar por fetch/API
  const rank = s.rankActiveDays;
  const ranks = rankWithTies(rank);
  // ... monta o JSX com os dados já resolvidos
}
```

Note: `HomePage` é `async` — só é possível porque é um Server Component. Não existe `useEffect` buscando dado aqui; o dado já chega pronto no HTML enviado ao browser.

**Exemplo real de Client Component** (`src/app/admin/AdminList.tsx`, trecho):
```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function review(id: string, action: "APPROVE" | "REJECT") {
    setBusy(id);
    const res = await fetch(`/api/activities/${id}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action })
    });
    setBusy(null);
    if (res.ok) router.refresh(); // re-busca os Server Components da página atual
  }
  // ...
}
```

Padrão comum no projeto: a **página** (`admin/page.tsx`) é Server Component e busca a lista inicial via Prisma; ela passa esses dados como prop para um Client Component (`AdminList`) que cuida só da interação (clicar em aprovar/rejeitar). Depois de uma ação, `router.refresh()` — não um `useEffect` refazendo fetch — é como a UI se atualiza com o dado novo do servidor.

---

## 5.4 — Data fetching: os dois padrões reais

1. **Server Component busca direto via Prisma** — é o padrão preferencial para qualquer leitura inicial de página. Sem API intermediária, sem estado de loading, sem `useEffect`.
2. **Client Component usa `fetch()` nativo** para mutações (criar, aprovar, deletar) — sempre contra uma rota `route.ts` própria do projeto, nunca direto no Prisma (Client Components rodam no browser, não têm acesso ao banco).

**O que o projeto não tem:** React Query/SWR (cache/revalidação automática de fetch), Zustand (estado global fora do React), React Hook Form (gestão de formulário) ou Axios (cliente HTTP com interceptors). Cada tela com mutação implementa seu próprio `busy`/`loading` local com `useState`, e cada `fetch` é escrito na mão — isso significa que há hoje **13 chamadas `fetch()` cruas** espalhadas pelo projeto, cada uma com sua cópia do mesmo padrão de estado, e pelo menos uma delas (`AdminList.tsx`) não trata o caso de resposta com erro (`if (res.ok) router.refresh()` — se `res.ok` for falso, nada acontece, nem mensagem de erro). Isso é um gap real, não uma escolha de design — ver `12-guia-vibecoding.md` para a recomendação de extrair um hook `useApiMutation` compartilhado quando for tocar em qualquer uma dessas telas.

---

## 5.5 — Formulários

Sem React Hook Form/Zod no client: formulários usam `<form>` HTML padrão, leitura via `FormData` no submit (client) e validação manual espelhada do lado da rota de API (ver `04-rotas-de-api.md` §4.4 sobre a ausência de Zod também no server). Upload de arquivo (comprovante) é sempre via `multipart/form-data` (campo `File` dentro do `FormData`), nunca base64 em JSON.

---

## 5.6 — Design system: tema Tailwind próprio

Não há shadcn/ui. O "design system" é um conjunto de cores e classes utilitárias customizadas em `tailwind.config.ts`, com identidade visual tática (referência: Valorant):

```ts
// tailwind.config.ts (real, resumido)
colors: {
  val: {
    red: "#FF4655", redDark: "#BD3944", cream: "#D4DCF0",
    bg: "#06091A", bgDark: "#03050F", panel: "#0D1330",
    line: "#1E2E55", gold: "#F0C040", cyan: "#4AB8D4",
  },
  rpg: {
    purple: "#7C4DFF", blue: "#3D7FFF", violet: "#A78BFA", teal: "#2DD4BF",
    gold: "#F0C040", silver: "#8FA8C8", bronze: "#C07030",
    dark: "#06091A", panel: "#0D1330", card: "#101A38",
    border: "#1E2E55", text: "#D4DCF0", textDim: "#5A6A8A",
  }
},
fontFamily: {
  display: ["var(--font-display)", "Impact", "sans-serif"],
  mono: ["var(--font-mono)", "monospace"]
},
letterSpacing: { wider2: "0.15em" },
clipPath: {
  notch: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)"
}
```

Classes utilitárias compostas (definidas em `src/app/globals.css`, ex. `val-card`, `val-btn`, `val-btn-outline`, `val-heading`, `clip-notch`) são usadas em todo o projeto para manter consistência visual — **antes de escrever uma classe Tailwind do zero para um cartão/botão novo, verifique se `val-card`/`val-btn` já resolve.** Não instale shadcn/ui nem outra lib de componentes UI sem alinhar com o time — mudaria a identidade visual do projeto inteiro.

---

## 5.7 — Achados reais que pedem atenção ao mexer em componentes

- **`src/app/page.tsx` tem ~434 linhas**, a maior do projeto — mistura busca de dado no servidor com apresentação (pódio, gradientes, subcomponentes `RankRow`/`MissionStat` definidos no mesmo arquivo). Ao tocar nessa página, prefira extrair subcomponentes para arquivos próprios em vez de crescer o arquivo ainda mais.
- **Lógica de medalha/tier reimplementada 3 vezes** de forma independente: em `page.tsx` (`RankRow`), em `PodiumShield.tsx` e em `MedalGauge.tsx`. A fonte de verdade correta é `medalForTotal()` em `src/lib/scoring.ts` — qualquer nova implementação de badge de medalha deve importar dali, não recalcular.
- **`<Th>`/`<Td>` de tabela duplicados quase verbatim** em `UsersManager.tsx`, `demandas/page.tsx` e `MinhasTable.tsx`. Candidato natural a virar um componente de tabela compartilhado em `src/components/`.
- **Mapeamento status→cor/label duplicado e divergente** em `StatusBadge.tsx`, `MinhasTable.tsx` e `AllActivitiesHistory.tsx` (ver também `03-nomenclatura-e-padroes.md` §3.4).

Nenhum desses é bloqueante para trabalhar no projeto — são apontados aqui para quem for mexer nesses arquivos evitar criar uma quarta cópia da mesma lógica.

---

## 5.8 — Performance e SEO

O projeto usa `export const dynamic = "force-dynamic"` nas páginas que sempre precisam de dado fresco (ex. o HUB, porque ranking e pontuação mudam a cada atividade aprovada) — isso desliga a otimização estática do Next para essas rotas deliberadamente; não é um esquecimento. Fora isso, o projeto não usa `next/image` para os uploads de usuário (eles são servidos por uma rota protegida própria, `/uploads/[...path]`, não por um CDN de imagem), nem Metadata API customizada por página — são otimizações possíveis, não implementadas hoje.
