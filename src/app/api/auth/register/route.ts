/**
 * @file src/app/api/auth/register/route.ts
 * @description Production-ready email+password registration API.
 * - Zod validation (strong password rules via security/validation.ts)
 * - bcrypt password hashing (cost 12)
 * - Rate limiting: max 5 registrations per 15 min per IP
 * - Constant-time email uniqueness check to prevent user enumeration
 * - Auto-detects Google-only accounts and returns a friendly message
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/security";
import { RateLimiterMemory } from "rate-limiter-flexible";

import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

// 5 attempts per 15 minutes per IP
const registerLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
});

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  try {
    await registerLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  // ── Parse & validate body ──────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, password, name } = result.data;

  // ── Check uniqueness ───────────────────────────────────────────────────────
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  if (existingUser) {
    if (!existingUser.password) {
      // Google-only account — guide the user
      return NextResponse.json(
        { error: "This email is linked to a Google account. Please sign in with Google." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  // ── Hash & create ──────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email,
      password: hashedPassword,
      role: "CUSTOMER",
    },
    select: { id: true, name: true, email: true },
  });

  // ── Generate Verification Token ────────────────────────────────────────────
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      email: email,
      token,
      expires,
      type: "EMAIL_VERIFICATION",
    },
  });

  await sendVerificationEmail(email, token);

  return NextResponse.json(
    { message: "Account created successfully. Please check your email to verify your account.", user: { id: user.id, name: user.name, email: user.email } },
    { status: 201 }
  );
}
