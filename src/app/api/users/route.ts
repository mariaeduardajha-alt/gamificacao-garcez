import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const name = (body.name as string)?.trim();
  const email = (body.email as string)?.trim().toLowerCase();
  const sector = ((body.sector as string) || "").trim() || null;
  const role = body.role === "ADMIN" ? Role.ADMIN : Role.USER;
  const password = (body.password as string) || "";

  if (!name || !email || password.length < 6) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "email_taken" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, sector, role, passwordHash }
  });

  return NextResponse.json({ ok: true, id: user.id });
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, sector: true, role: true, createdAt: true }
  });
  return NextResponse.json({ users });
}
