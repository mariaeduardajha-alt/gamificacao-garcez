/**
 * Formatação de datas e nomes — fonte única.
 *
 * Datas do jogo (data do exercício, conclusão da demanda) são salvas ao
 * meio-dia UTC, então são sempre formatadas em UTC: assim o dia exibido é
 * o mesmo que a pessoa digitou, independente do fuso do navegador/servidor.
 */

/** "08/06/2026" */
export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** "08.JUN.2026" — usado nos cabeçalhos estilo tático. */
export function formatTacticalDate(d: Date | string): string {
  const date = new Date(d);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = date.toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" }).replace(".", "").toUpperCase();
  return `${day}.${month}.${date.getUTCFullYear()}`;
}

/** "Jun–Jul 2026" (ou "Jun 2026" se for o mesmo mês). */
export function formatMonthRange(start: Date | string, end: Date | string): string {
  const month = (d: Date) => {
    const m = d.toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" }).replace(".", "");
    return m.charAt(0).toUpperCase() + m.slice(1);
  };
  const s = new Date(start), e = new Date(end);
  const sm = month(s), em = month(e);
  return sm === em ? `${sm} ${e.getUTCFullYear()}` : `${sm}–${em} ${e.getUTCFullYear()}`;
}

/** Data de hoje no fuso do usuário, no formato do <input type="date"> ("AAAA-MM-DD"). */
export function todayInputValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "AAAA-MM-DD" (UTC) de uma data salva — para o atributo min/max do <input type="date">. */
export function toInputValue(d: Date | string): string {
  return new Date(d).toISOString().slice(0, 10);
}

/** Converte o valor do <input type="date"> na data salva no banco (meio-dia UTC). */
export function dateFromInput(value: string): Date {
  return new Date(value + "T12:00:00Z");
}

/** Iniciais do nome: "Maria Eduarda" → "ME", "Kelly" → "K". */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";
}

/** Primeiro nome: "Luiz Garcez" → "Luiz". */
export function firstName(name: string): string {
  return name.split(" ")[0];
}
