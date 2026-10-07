import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUpload, isAllowedImage } from "@/lib/storage";
import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, withApiHandler } from "@/lib/api-response";
import { MAX_AVATAR_SIZE_BYTES } from "@/lib/constants";

export const runtime = "nodejs";

/** Atualiza a foto de perfil do usuário logado. */
export const POST = withApiHandler(async (req: NextRequest) => {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const { session } = authResult;

  const form = await req.formData();
  const file = form.get("avatar") as File | null;
  if (!file || file.size === 0) return apiError("no_file");
  if (file.size > MAX_AVATAR_SIZE_BYTES) return apiError("file_too_large");
  if (!isAllowedImage(file)) return apiError("invalid_file");

  const avatarUrl = await saveUpload(session.user.id, file);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl },
  });

  return apiSuccess({ ok: true, avatarUrl });
});

/** Remove a foto de perfil do usuário logado. */
export const DELETE = withApiHandler(async () => {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  await prisma.user.update({
    where: { id: authResult.session.user.id },
    data: { avatarUrl: null },
  });

  return apiSuccess({ ok: true, avatarUrl: null });
});
