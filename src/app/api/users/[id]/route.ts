import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.sector === "string") data.sector = body.sector.trim() || null;
  if (body.role === "ADMIN" || body.role === "USER") data.role = body.role as Role;
  if (typeof body.password === "string" && body.password.length >= 6) {
    data.passwordHash = await bcrypt.hash(body.password, 10);
  }
  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ ok: true, user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "cant_delete_self" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
