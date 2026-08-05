import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // We do not return 404 to prevent email enumeration. We just return success silently if user doesn't exist.
    if (user) {
      // 1. Generate Token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      // 2. Save Token in DB (overwrite existing token if requested again)
      await prisma.verificationToken.deleteMany({
        where: { email: user.email, type: "PASSWORD_RESET" },
      });

      await prisma.verificationToken.create({
        data: {
          email: user.email,
          token,
          expires,
          type: "PASSWORD_RESET",
        },
      });

      // 3. Send Email
      await sendPasswordResetEmail(user.email, token);
    }

    return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
