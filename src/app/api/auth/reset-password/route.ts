import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // 1. Find token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.type !== "PASSWORD_RESET") {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // 2. Check expiration
    if (new Date() > verificationToken.expires) {
      // Clean it up
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Reset token has expired. Please request a new one." }, { status: 400 });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(password.slice(0, 72), 10);

    // 4. Update user
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { password: hashedPassword },
    });

    // 5. Delete token so it can't be reused
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true, message: "Password reset successfully!" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
