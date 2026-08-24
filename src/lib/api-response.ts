import { NextRequest, NextResponse } from "next/server";

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "invalid_input"
  | "invalid_action"
  | "not_found"
  | "file_too_large"
  | "no_file"
  | "email_taken"
  | "cant_delete_self"
  | "internal_error";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  invalid_input: 400,
  invalid_action: 400,
  not_found: 404,
  file_too_large: 413,
  no_file: 400,
  email_taken: 409,
  cant_delete_self: 409,
  internal_error: 500,
};

export function apiError(code: ApiErrorCode) {
  return NextResponse.json({ error: code }, { status: STATUS_BY_CODE[code] });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Garante que uma exceção não tratada vire `{ error: "internal_error" }`
 * em vez de um 500 cru do Next (formato inconsistente com o caminho feliz).
 */
export function withApiHandler<Req extends Request = NextRequest, Ctx = any>(
  handler: (req: Req, ctx: Ctx) => Promise<Response>
) {
  return async (req: Req, ctx: Ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      console.error("[api]", err);
      return apiError("internal_error");
    }
  };
}
