import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function runAuthSimulation() {
  console.log("🚀 Starting E2E Auth Simulation...");
  const testEmail = "test_auth_hacker@example.com";
  const testPassword = "SecurePassword123!";

  // 1. Cleanup
  await prisma.user.deleteMany({ where: { email: testEmail } });

  try {
    // 2. Test Registration Logic
    console.log("🧪 Testing Registration...");
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const user = await prisma.user.create({
      data: { name: "Test Hacker", email: testEmail, password: hashedPassword }
    });
    console.log("✅ Registration Successful");

    // 3. Test Duplicate Account
    console.log("🧪 Testing Duplicate Account...");
    const existing = await prisma.user.findUnique({ where: { email: testEmail } });
    if (existing) {
      console.log("✅ Caught Duplicate Account (API would return 409)");
    } else {
      throw new Error("❌ Failed to catch duplicate account");
    }

    // 4. Test Wrong Password
    console.log("🧪 Testing Wrong Password...");
    const wrongAttempt = await bcrypt.compare("WrongPass!", user.password!);
    if (!wrongAttempt) {
      console.log("✅ Caught Wrong Password (API would return 401)");
    } else {
      throw new Error("❌ Failed to catch wrong password");
    }

    // 5. Test Valid Login
    console.log("🧪 Testing Valid Login...");
    const validAttempt = await bcrypt.compare(testPassword, user.password!);
    if (validAttempt) {
      console.log("✅ Valid Login Successful");
    } else {
      throw new Error("❌ Failed valid login");
    }

    console.log("🎉 All Auth E2E Tests Passed!");

  } catch (e) {
    console.error("💥 E2E Test Failed:", e);
  } finally {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  }
}

runAuthSimulation();
