import { CartRepository } from "@/repositories/cart.repository";

export class CartService {
  static async getCart(userId: string) {
    const items = await CartRepository.findManyByUserId(userId);

    let subtotal = 0;
    const itemsWithTotals = items.map(item => {
      const lineTotal = item.product.price * item.quantity;
      subtotal += lineTotal;
      return { ...item, lineTotal };
    });

    const tax = subtotal * 0.18; // 18% tax example
    const shipping = subtotal > 1000 ? 0 : 50;
    const total = subtotal + tax + shipping;

    return {
      items: itemsWithTotals,
      summary: {
        subtotal,
        tax,
        shipping,
        total,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
      }
    };
  }

  static async addToCart(userId: string, productId: string, quantity = 1) {
    const existing = await CartRepository.findUnique(userId, productId);

    if (existing) {
      return CartRepository.update(existing.id, { quantity: existing.quantity + quantity });
    }

    return CartRepository.create(userId, productId, quantity);
  }

  static async updateQuantity(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }

    return CartRepository.updateByCompositeKey(userId, productId, quantity);
  }

  static async removeFromCart(userId: string, productId: string) {
    return CartRepository.delete(userId, productId);
  }
}
