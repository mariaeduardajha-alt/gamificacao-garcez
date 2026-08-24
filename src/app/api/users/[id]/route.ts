import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { requireAdmin } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";

export const PATCH = withApiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const authResult = await requireAdmin();
    if (!authResult.ok) return authResult.response;

    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.sector === "string") data.sector = body.sector.trim() || null;
    if (body.role === "ADMIN" || body.role === "USER") data.role = body.role as Role;
    if (typeof body.password === "string" && body.password.length >= 6) {
      data.passwordHash = await bcrypt.hash(body.password, 10);
    }
    const user = await prisma.user.update({ where: { id }, data });
    return apiSuccess({ ok: true, user });
  }
);

export const DELETE = withApiHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const authResult = await requireAdmin();
    if (!authResult.ok) return authResult.response;

    const { id } = await params;
    if (id === authResult.session.user.id) {
      return apiError("cant_delete_self");
    }
    await prisma.user.delete({ where: { id } });
    return apiSuccess({ ok: true });
  }
);
