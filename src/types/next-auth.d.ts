import "next-auth";
import "next-auth/jwt";
import { Role } from "@prisma/client";

/** Campos extras que o app guarda no usuário da sessão (ver callbacks em lib/auth.ts). */
declare module "next-auth" {
  interface User {
    role: Role;
    avatarUrl: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      avatarUrl: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    avatarUrl: string | null;
  }
}
