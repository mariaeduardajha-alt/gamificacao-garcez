import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUpload, isAllowedImage, MAX_PROOF_SIZE_BYTES } from "@/lib/storage";
import { WEIGHT_POINTS } from "@/lib/game-rules";
import { dateFromInput } from "@/lib/format";
import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { createDemandSchema } from "@/lib/schemas";

export const runtime = "nodejs";

/** Registra uma demanda concluída (fica PENDING até o admin revisar). */
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
  const { title, weight, completedAt, client, notes } = parsed.data;

  const file = form.get("proof") as File | null;
  const hasFile = !!file && file.size > 0;
  if (hasFile && file.size > MAX_PROOF_SIZE_BYTES) return apiError("file_too_large");
  if (hasFile && !isAllowedImage(file)) return apiError("invalid_file");

  const proofUrl = hasFile ? await saveUpload(session.user.id, file) : null;

  const demand = await prisma.demand.create({
    data: {
      userId: session.user.id,
      title,
      client: client || null,
      weight,
      points: WEIGHT_POINTS[weight],
      completedAt: dateFromInput(completedAt),
      proofUrl,
      notes: notes || null,
      status: "PENDING",
    },
  });

  return apiSuccess({ ok: true, id: demand.id });
});
