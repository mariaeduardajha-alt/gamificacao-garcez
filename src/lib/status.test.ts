import { describe, it, expect } from "vitest";
import { STATUS_META } from "./status";

describe("STATUS_META", () => {
  it("cobre os 3 status possíveis com label e cor definidos", () => {
    for (const key of ["PENDING", "APPROVED", "REJECTED"] as const) {
      expect(STATUS_META[key].label).toBeTruthy();
      expect(STATUS_META[key].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("cada status tem uma cor distinta (evita a divergência das 3 cópias antigas)", () => {
    const colors = Object.values(STATUS_META).map((s) => s.color);
    expect(new Set(colors).size).toBe(colors.length);
  });
});
