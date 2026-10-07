"use client";

import { useState, useCallback } from "react";
import { apiErrorMessage } from "@/lib/error-messages";

type MutationBody = unknown | FormData;

/**
 * Hook compartilhado pra chamadas de mutação (`fetch` com POST/PATCH/DELETE).
 * Substitui os `fetch()` crus espalhados pelos componentes, cada um com seu
 * próprio `busy`/loading local — e faz erros pararem de ser silenciados
 * (alguns call sites antigos simplesmente ignoravam `!res.ok`).
 *
 * Erros da API viram `Error` com a mensagem já traduzida para o usuário
 * (ver lib/error-messages.ts).
 *
 * `body` pode ser um objeto qualquer (vira JSON) ou uma instância de
 * `FormData` (enviada como veio, sem `Content-Type` manual — necessário
 * pro upload de arquivos em `/api/activities`, `/api/demands` e
 * `/api/profile`, que esperam multipart, não JSON).
 */
export function useApiMutation<TBody extends MutationBody = unknown>() {
  const [state, setState] = useState({ busy: false, error: null as string | null });

  const mutate = useCallback(
    async (url: string, body?: TBody, method: "POST" | "PATCH" | "DELETE" = "POST") => {
      setState({ busy: true, error: null });
      try {
        const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
        const res = await fetch(url, {
          method,
          headers: isFormData || body === undefined ? undefined : { "Content-Type": "application/json" },
          body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ? apiErrorMessage(payload.error) : `Erro ${res.status}`);
        }
        setState({ busy: false, error: null });
        return await res.json().catch(() => null);
      } catch (err) {
        setState({ busy: false, error: err instanceof Error ? err.message : "Erro desconhecido" });
        throw err;
      }
    },
    []
  );

  return { ...state, mutate };
}
