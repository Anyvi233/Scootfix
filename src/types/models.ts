import { Prisma } from "@prisma/client";

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: { images: true }
        }
      }
    };
    user: {
      select: { name: true; email: true }
    }
  }
}>;

export type CartWithItems = { userId: string, items: Prisma.CartItemGetPayload<{ include: { product: { select: { name: true; price: true; images: true } } } }>[] };

export type ReturnWithItems = Prisma.ReturnGetPayload<{
  include: {
    items: {
      include: {
        orderItem: {
          select: { name: true; price: true; productId: true; product: { select: { images: true } } }
        }
      }
    };
    user: { select: { name: true; email: true } };
    order: { select: { orderNumber: true; total: true } }
  }
}>;
