import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    if (!await isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    const mappedUsers = users.map(u => ({
      id: u.id,
      name: u.name || "User",
      email: u.email,
      role: u.role,
      joined: new Date(u.createdAt).toLocaleDateString("en-IN", {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    }));

    return NextResponse.json(mappedUsers);
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 400 });
  }
}
