import { describe, it, expect } from "vitest";
import { isGameRoute } from "./sections";

describe("isGameRoute", () => {
  it("reconhece as páginas de Jogos e Meta dos Setores, inclusive subpáginas", () => {
    expect(isGameRoute("/movimento-em-jogo")).toBe(true);
    expect(isGameRoute("/demandas/nova")).toBe(true);
    expect(isGameRoute("/admin/usuarios")).toBe(true);
  });

  it("deixa o restante do site na identidade institucional", () => {
    expect(isGameRoute("/")).toBe(false);
    expect(isGameRoute("/campanhas")).toBe(false);
    expect(isGameRoute("/registrar-algo")).toBe(false);
  });
});
