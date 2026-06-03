import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WEIGHT_POINTS } from "@/lib/scoring";
import { DemandWeight } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, weight, note } = body as {
    action: "APPROVE" | "REJECT";
    weight?: DemandWeight;
    note?: string;
  };
  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const data: any = {
    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
    reviewNote: note || null,
    reviewedBy: session.user.id,
    reviewedAt: new Date()
  };
  if (action === "APPROVE" && weight && WEIGHT_POINTS[weight]) {
    data.weight = weight;
    data.points = WEIGHT_POINTS[weight];
  }

  const updated = await prisma.demand.update({ where: { id }, data });
  return NextResponse.json({ ok: true, demand: updated });
}
