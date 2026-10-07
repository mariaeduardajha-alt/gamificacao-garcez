import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: newSession }) {
      if (user) {
        token.id        = user.id;
        token.role      = user.role;
        token.avatarUrl = user.avatarUrl ?? null;
      }
      // Permite atualizar avatarUrl via useSession().update()
      if (trigger === "update" && newSession?.avatarUrl !== undefined) {
        token.avatarUrl = newSession.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id        = token.id;
        session.user.role      = token.role;
        session.user.avatarUrl = token.avatarUrl ?? null;
      }
      return session;
    }
  }
};

/** Sessão atual em Server Components / rotas de API (null se não logado). */
export const auth = () => getServerSession(authOptions);

/** Para páginas: exige login (senão manda para /login) e devolve a sessão. */
export async function requireSession() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

/** Para páginas de admin: exige login + role ADMIN (senão manda para o HUB). */
export async function requireAdminSession() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}
