import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { updateUserSchema } from "@/lib/schemas";

/** Admin edita nome, setor, cargo e/ou senha de um agente. */
export const PATCH = withApiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const authResult = await requireAdmin();
    if (!authResult.ok) return authResult.response;

    const { id } = await params;
    const parsed = updateUserSchema.safeParse(await req.json());
    if (!parsed.success) return apiError("invalid_input");
    const { name, sector, role, password } = parsed.data;

    await prisma.user.update({
      where: { id },
      data: {
        name,
        role,
        ...(sector !== undefined ? { sector: sector || null } : {}),
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      },
    });
    // Não devolve o registro: ele contém o hash da senha
    return apiSuccess({ ok: true });
  }
);

/** Admin remove um agente (e, em cascata, suas atividades e demandas). */
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
