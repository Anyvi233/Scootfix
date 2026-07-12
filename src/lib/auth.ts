/**
 * @file src/lib/auth.ts
 * @description NextAuth configuration with bcrypt password verification,
 * JWT session strategy, and audit logging for login success/failure.
 */

import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { logFailedLogin, logSuccessfulLogin } from "./security/audit-logger";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Limit inputs to avoid timing attacks / oversized payloads
        const email = credentials.email.slice(0, 255).toLowerCase().trim();
        const password = credentials.password.slice(0, 72);

        const ip =
          (req as any)?.headers?.["x-forwarded-for"] ??
          (req as any)?.headers?.["x-real-ip"] ??
          undefined;

        const user = await prisma.user.findUnique({ where: { email } });

        // Use constant-time compare even when user doesn't exist (prevent user enumeration)
        const dummyHash = "$2a$10$dummyhash.to.prevent.timing.attacks.on.missing.accounts";
        const hashToCompare = user?.password ?? dummyHash;
        const isCorrectPassword = await bcrypt.compare(password, hashToCompare);

        if (!user || !user.password || !isCorrectPassword) {
          await logFailedLogin(email, ip);
          throw new Error("Invalid email or password");
        }

        await logSuccessfulLogin(user.id, ip);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // refresh every 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
