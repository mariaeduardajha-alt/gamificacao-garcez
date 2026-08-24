import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import type { Session } from "next-auth";

type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; response: Response };

/** Elimina a checagem `if (!session) return NextResponse.json({error:"unauthorized"},{status:401})` duplicada em toda rota. */
export async function requireAuth(): Promise<AuthResult> {
  const session = await auth();
  if (!session) return { ok: false, response: apiError("unauthorized") };
  return { ok: true, session };
}

/** Mesma checagem, exigindo também `role === "ADMIN"`. */
export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireAuth();
  if (!result.ok) return result;
  if (result.session.user.role !== "ADMIN") {
    return { ok: false, response: apiError("forbidden") };
  }
  return result;
}
