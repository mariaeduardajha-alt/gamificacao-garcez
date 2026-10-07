import type { Prisma, Activity, Demand } from "@prisma/client";

/** Resumo de usuário para a tela de gestão (`/admin/usuarios`). */
export type UserSummary = Prisma.UserGetPayload<{
  select: { id: true; name: true; email: true; sector: true; role: true; createdAt: true };
}>;

/* ── Variantes serializadas — o que os Client Components realmente recebem ──
   Os Server Components desta app fazem `JSON.parse(JSON.stringify(...))`
   antes de passar os dados como prop pra um Client Component, o que
   converte `Date` em `string`. Esses tipos refletem esse formato real. */

export type ActivityRecordSerialized = Omit<Activity, "date" | "createdAt" | "reviewedAt"> & {
  date: string;
  createdAt: string;
  reviewedAt: string | null;
};

export type ActivityWithUserSerialized = ActivityRecordSerialized & {
  user: { name: string; email: string };
};

export type DemandWithUserSerialized = Omit<Demand, "completedAt" | "createdAt" | "reviewedAt"> & {
  completedAt: string;
  createdAt: string;
  reviewedAt: string | null;
  user: { name: string; email: string };
};

export type UserSummarySerialized = Omit<UserSummary, "createdAt"> & {
  createdAt: string;
};
