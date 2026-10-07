import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { requireAdmin } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: NextRequest) => {
  const authResult = await requireAdmin();
  if (!authResult.ok) return authResult.response;

  const body = await req.json();
  const name = (body.name as string)?.trim();
  const email = (body.email as string)?.trim().toLowerCase();
  const sector = ((body.sector as string) || "").trim() || null;
  const role = body.role === "ADMIN" ? Role.ADMIN : Role.USER;
  const password = (body.password as string) || "";

  if (!name || !email || password.length < 6) {
    return apiError("invalid_input");
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return apiError("email_taken");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, sector, role, passwordHash },
  });

  return apiSuccess({ ok: true, id: user.id });
});
