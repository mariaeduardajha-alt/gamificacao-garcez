import type { ApiErrorCode } from "./api-response";

/** Texto exibido ao usuário para cada código de erro da API (ver api-response.ts). */
export const API_ERROR_MESSAGE: Record<ApiErrorCode, string> = {
  unauthorized:     "Sua sessão expirou. Entre novamente.",
  forbidden:        "Você não tem permissão para esta ação.",
  invalid_input:    "Confira os dados preenchidos.",
  invalid_action:   "Ação inválida.",
  invalid_file:     "Envie uma imagem (JPG, PNG, WEBP, GIF ou HEIC).",
  not_found:        "Registro não encontrado.",
  file_too_large:   "Arquivo grande demais.",
  no_file:          "Selecione um arquivo.",
  email_taken:      "Este e-mail já está cadastrado.",
  cant_delete_self: "Você não pode remover o próprio usuário.",
  internal_error:   "Erro inesperado. Tente novamente.",
};

export function apiErrorMessage(code: string): string {
  return API_ERROR_MESSAGE[code as ApiErrorCode] ?? code;
}
