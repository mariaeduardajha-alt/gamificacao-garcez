import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";

export const DELETE = withApiHandler(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;
    const { session } = authResult;

    const { id } = await params;

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) return apiError("not_found");

    // Só o próprio usuário pode excluir (ou admin)
    if (activity.userId !== session.user.id && session.user.role !== "ADMIN") {
      return apiError("forbidden");
    }

    await prisma.activity.delete({ where: { id } });
    return apiSuccess({ ok: true });
  }
);
