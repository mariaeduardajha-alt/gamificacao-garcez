import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, kcal, note } = body as {
    action: "APPROVE" | "REJECT";
    kcal?: number;
    note?: string;
  };

  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      status: action === "APPROVE" ? "APPROVED" : "REJECTED",
      kcal: action === "APPROVE" && Number.isFinite(kcal) && kcal! > 0 ? Math.round(kcal!) : undefined,
      reviewNote: note || null,
      reviewedBy: session.user.id,
      reviewedAt: new Date()
    }
  });

  return NextResponse.json({ ok: true, activity: updated });
}
