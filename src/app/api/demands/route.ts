import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveProof } from "@/lib/storage";
import { WEIGHT_POINTS } from "@/lib/scoring";
import { DemandWeight } from "@prisma/client";

export const runtime = "nodejs";

const validWeights = new Set<DemandWeight>(["SMALL", "MEDIUM", "LARGE", "EPIC"]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const title = (form.get("title") as string)?.trim();
  const client = ((form.get("client") as string) || "").trim() || null;
  const weight = form.get("weight") as DemandWeight;
  const completedAt = form.get("completedAt") as string;
  const notes = ((form.get("notes") as string) || "").trim() || null;
  const file = form.get("proof") as File | null;

  if (!title || !validWeights.has(weight) || !completedAt) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  let proofUrl: string | null = null;
  if (file && file.size > 0) {
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "file_too_large" }, { status: 400 });
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
      completedAt: new Date(completedAt),
      proofUrl,
      notes,
      status: "PENDING"
    }
  });

  return NextResponse.json({ ok: true, id: demand.id });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const items = await prisma.demand.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: "desc" }
  });
  return NextResponse.json({ items });
}
