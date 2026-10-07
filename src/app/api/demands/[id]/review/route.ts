import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { WEIGHT_POINTS } from "@/lib/game-rules";
import { requireAdmin } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { reviewActionSchema } from "@/lib/schemas";
import { reviewDecisionFields } from "@/lib/review";

/** Admin aprova (podendo ajustar o peso) ou rejeita uma demanda. */
export const POST = withApiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const authResult = await requireAdmin();
    if (!authResult.ok) return authResult.response;
    const { session } = authResult;

    const { id } = await params;
    const parsed = reviewActionSchema.safeParse(await req.json());
    if (!parsed.success) return apiError("invalid_action");
    const { action, note, weight } = parsed.data;

    const updated = await prisma.demand.update({
      where: { id },
      data: {
        ...reviewDecisionFields(action, session.user.id, note),
        ...(action === "APPROVE" && weight ? { weight, points: WEIGHT_POINTS[weight] } : {}),
      },
    });
    return apiSuccess({ ok: true, demand: updated });
  }
);
