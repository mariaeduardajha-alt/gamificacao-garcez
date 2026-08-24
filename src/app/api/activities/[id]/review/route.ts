import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { reviewActionSchema } from "@/lib/schemas";
import { reviewDecisionFields } from "@/lib/review";

export const POST = withApiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const authResult = await requireAdmin();
    if (!authResult.ok) return authResult.response;
    const { session } = authResult;

    const { id } = await params;
    const body = await req.json();
    const parsed = reviewActionSchema.safeParse(body);
    if (!parsed.success) return apiError("invalid_action");
    const { action, note } = parsed.data;
    const kcal = (body as { kcal?: number }).kcal;

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        ...reviewDecisionFields(action, session.user.id, note),
        kcal: action === "APPROVE" && Number.isFinite(kcal) && kcal! > 0 ? Math.round(kcal!) : undefined,
      },
    });

    return apiSuccess({ ok: true, activity: updated });
  }
);
