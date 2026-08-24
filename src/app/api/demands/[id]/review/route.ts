import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { WEIGHT_POINTS } from "@/lib/scoring";
import { DemandWeight } from "@prisma/client";
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
    const weight = (body as { weight?: DemandWeight }).weight;

    const data: Record<string, unknown> = reviewDecisionFields(action, session.user.id, note);
    if (action === "APPROVE" && weight && WEIGHT_POINTS[weight]) {
      data.weight = weight;
      data.points = WEIGHT_POINTS[weight];
    }

    const updated = await prisma.demand.update({ where: { id }, data });
    return apiSuccess({ ok: true, demand: updated });
  }
);
