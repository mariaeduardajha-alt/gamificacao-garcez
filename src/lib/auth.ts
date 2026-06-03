import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
        token.id        = (user as any).id;
        token.role      = (user as any).role;
        token.avatarUrl = (user as any).avatarUrl ?? null;
      }
      // Permite atualizar avatarUrl via useSession().update()
      if (trigger === "update" && newSession?.avatarUrl !== undefined) {
        token.avatarUrl = newSession.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id        = token.id;
        (session.user as any).role      = token.role;
        (session.user as any).avatarUrl = token.avatarUrl ?? null;
      }
      return session;
    }
  }
};

export const auth = () => getServerSession(authOptions);
