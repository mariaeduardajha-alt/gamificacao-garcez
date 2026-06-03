import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveProof } from "@/lib/storage";

export const runtime = "nodejs";

// Atualiza foto de perfil
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("avatar") as File | null;
  if (!file || file.size === 0) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "file_too_large" }, { status: 400 });

  const avatarUrl = await saveProof((session.user as any).id, file);

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { avatarUrl }
  });

  return NextResponse.json({ ok: true, avatarUrl });
}

// Remove foto de perfil
export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { avatarUrl: null }
  });

  return NextResponse.json({ ok: true, avatarUrl: null });
}
