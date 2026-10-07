import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { createUserSchema } from "@/lib/schemas";

export const runtime = "nodejs";

/** Admin cadastra um novo agente. */
export const POST = withApiHandler(async (req: NextRequest) => {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult.response;

  const parsed = createUserSchema.safeParse(await req.json());
  if (!parsed.success) return apiError("invalid_input");
  const { name, email, sector, role, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return apiError("email_taken");

  const user = await prisma.user.create({
    data: { name, email, sector: sector || null, role, passwordHash: await bcrypt.hash(password, 10) },
  });

  return apiSuccess({ ok: true, id: user.id });
});
