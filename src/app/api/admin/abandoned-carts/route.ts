import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/mailer";

// In-memory cache to prevent spamming users in development (cooldown of 12 hours)
const lastSentCache = new Map<string, number>();
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all users who have items in their cart
    const usersWithCarts = await prisma.user.findMany({
      where: {
        cartItems: {
          some: {},
        },
      },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const now = Date.now();
    const abandonedCarts = usersWithCarts.map((user) => {
      // Find oldest update timestamp
      const oldestItem = user.cartItems.reduce((oldest, item) => {
        return item.updatedAt < oldest.updatedAt ? item : oldest;
      }, user.cartItems[0]);

      const inactiveTimeMs = now - new Date(oldestItem.updatedAt).getTime();
      const lastSentTime = lastSentCache.get(user.email) || 0;
      const isEligible = inactiveTimeMs > 5 * 60 * 1000 && (now - lastSentTime > TWELVE_HOURS);

      return {
        userId: user.id,
        name: user.name || "Customer",
        email: user.email,
        itemCount: user.cartItems.reduce((total, i) => total + i.quantity, 0),
        inactiveMinutes: Math.floor(inactiveTimeMs / 60000),
        lastModified: oldestItem.updatedAt,
        isEligible,
        items: user.cartItems.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
      };
    });

    return NextResponse.json(abandonedCarts);
  } catch (error) {
    console.error("GET /api/admin/abandoned-carts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!user || user.cartItems.length === 0) {
      return NextResponse.json({ error: "User has no items in cart." }, { status: 404 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const cartUrl = `${baseUrl}/cart`;

    const emailData = {
      customerName: user.name || "Customer",
      customerEmail: user.email,
      items: user.cartItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      cartUrl,
    };

    await sendAbandonedCartEmail(emailData);

    // Save send time in cache
    lastSentCache.set(user.email, Date.now());

    return NextResponse.json({ success: true, message: `Email sent to ${user.email}` });
  } catch (error: unknown) {
    console.error("POST /api/admin/abandoned-carts error:", error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : "An error occurred") || "Failed to send email" }, { status: 500 });
  }
}
