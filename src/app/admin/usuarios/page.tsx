import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await requireAdminSession();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, sector: true, role: true, createdAt: true }
  });

  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div>
          <h1 className="val-heading text-3xl">Gestão de Agentes</h1>
          <p className="font-mono text-val-line text-xs uppercase tracking-wider2 mt-1">
            {users.length} agentes recrutados
          </p>
        </div>
        <UsersManager
          initial={JSON.parse(JSON.stringify(users))}
          currentUserId={session.user.id}
        />
      </main>
    </>
  );
}
