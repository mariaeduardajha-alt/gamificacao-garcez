/**
 * Rotas da área de gamificação (Jogos, Meta dos Setores e o admin do jogo).
 * Elas mantêm a estética de jogo; o restante do site usa a identidade
 * institucional de Pessoas e Cultura.
 */
export const GAME_ROUTES = [
  "/movimento-em-jogo",
  "/registrar",
  "/minhas",
  "/meta-dos-setores",
  "/demandas",
  "/admin",
] as const;

export function isGameRoute(pathname: string): boolean {
  return GAME_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}
