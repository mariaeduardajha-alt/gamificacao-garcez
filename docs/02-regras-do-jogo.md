# 02 — Regras do jogo

> Regras de negócio acordadas com a gestão. Os números moram em `src/lib/game-rules.ts`; o cálculo em `src/lib/scoring.ts` (coberto por testes em `scoring.test.ts`). Mudar uma regra = mudar o arquivo, os testes e este documento.

## Exercícios e dias ativos

- **Dia ativo:** dia em que a **soma** dos minutos de exercícios registrados chega a **30 min** (`MIN_MINUTES_PER_ACTIVE_DAY`). Dois treinos de 15 min no mesmo dia contam.
- **1 dia ativo = 10 pontos** (`POINTS_PER_ACTIVE_DAY`).
- **Meta semanal:** **3 dias ativos** na mesma semana ISO, de segunda a domingo (`WEEKLY_GOAL_DAYS`).
- **Bônus de constância:** **+20 pontos** por semana que bateu a meta (`CONSTANCY_BONUS_POINTS`).
- **Fórmula:** `pontos = dias ativos × 10 + semanas na meta × 20`.
- Exercícios entram **já aprovados**. Só contam os registrados dentro do período do desafio.
- O formulário aceita qualquer duração. Se o dia ainda não somou 30 min, ele avisa quanto falta.

## Ranking e desempate

Ordem oficial (`compareRank`): **1) pontos → 2) dias ativos → 3) semanas na meta → 4) minutos totais.**
Duas pessoas só dividem a colocação se empatarem em **todos** os critérios (padrão 1-2-2-4). Nome, ordem de cadastro etc. nunca desempatam.

## Escudos (bronze / prata / ouro)

| Escudo | Onde | Limiares |
|---|---|---|
| **Coletivo** | HUB, "Escudo da Equipe" | Soma dos **dias ativos** de todos × `bronzeActiveDays` / `silverActiveDays` / `goldActiveDays` do desafio (seed: 48 / 72 / 96). O bônus de constância **não** conta aqui. |
| **Individual** | Classificação completa e pop-up de conquista | Limiar coletivo ÷ número de participantes, arredondado. |
| **Setor** | `/meta-dos-setores` | `bronze` / `silver` / `gold` de cada `SectorGoal`, podendo ser "maior é melhor" ou "menor é melhor" (`direction`). |

- **Ação Social:** desbloqueada quando a equipe conquista o **escudo Ouro coletivo**.
- **Pontuação coletiva** (dias × 10 + bônus) é só exibida; não define escudo.

## Demandas

- Registradas manualmente com print opcional; ficam **pendentes** até o admin aprovar ou rejeitar.
- Peso → pontos: Rápida 5 · Padrão 15 · Pesada 30 · Épica 50 (`WEIGHT_POINTS`). O admin pode ajustar o peso ao aprovar.
- Hoje os pontos de demanda aparecem só em `/demandas` e **não entram no ranking**.

## Desafio

Um registro `Challenge` ativo define nome, período e limiares coletivos. Ele é criado pelo seed (`prisma/seed.ts`). As telas leem datas e período dele, sem nada fixo no código.

> **Atenção:** o seed roda a cada deploy e **regrava as datas e os limiares do desafio** com os valores do `seed.ts`. Para mudar o desafio, altere o `seed.ts`. Alterações feitas direto no banco são desfeitas no próximo deploy.
