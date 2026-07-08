import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user as { id: string; name?: string | null; email?: string | null; role: string } | undefined;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export function checkAuthResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function checkAdminResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
