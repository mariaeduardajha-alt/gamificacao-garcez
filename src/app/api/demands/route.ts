import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveProof } from "@/lib/storage";
import { WEIGHT_POINTS } from "@/lib/scoring";
import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { createDemandSchema } from "@/lib/schemas";
import { MAX_PROOF_SIZE_BYTES } from "@/lib/constants";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: NextRequest) => {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  const form = await req.formData();
  const parsed = createDemandSchema.safeParse({
    title: form.get("title"),
    client: form.get("client") || undefined,
    weight: form.get("weight"),
    completedAt: form.get("completedAt"),
    notes: form.get("notes") || undefined,
  });
  if (!parsed.success) return apiError("invalid_input");
  const { title, weight, completedAt } = parsed.data;
  const client = parsed.data.client || null;
  const notes = parsed.data.notes || null;

  const file = form.get("proof") as File | null;
  let proofUrl: string | null = null;
  if (file && file.size > 0) {
    if (file.size > MAX_PROOF_SIZE_BYTES) {
      return apiError("file_too_large");
    }
    proofUrl = await saveProof(session.user.id, file);
  }

  const demand = await prisma.demand.create({
    data: {
      userId: session.user.id,
      title,
      client,
      weight,
      points: WEIGHT_POINTS[weight],
      completedAt,
      proofUrl,
      notes,
      status: "PENDING",
    },
  });

  return apiSuccess({ ok: true, id: demand.id });
});
