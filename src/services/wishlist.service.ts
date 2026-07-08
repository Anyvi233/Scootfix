import { WishlistRepository } from "@/repositories/wishlist.repository";

export class WishlistService {
  static async getWishlist(userId: string) {
    return WishlistRepository.findManyByUserId(userId);
  }

  static async add(userId: string, productId: string) {
    const existing = await WishlistRepository.findUnique(userId, productId);

    if (!existing) {
      return WishlistRepository.create(userId, productId);
    }
    return existing;
  }

  static async remove(userId: string, productId: string) {
    return WishlistRepository.delete(userId, productId);
  }

  static async isWishlisted(userId: string, productId: string) {
    const item = await WishlistRepository.findUnique(userId, productId);
    return !!item;
  }
}
