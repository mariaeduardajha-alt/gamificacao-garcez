import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;

  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Só o próprio usuário pode excluir (ou admin)
  if (activity.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
