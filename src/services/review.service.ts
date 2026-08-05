import { ReviewRepository } from "@/repositories/review.repository";

export class ReviewService {
  static async createReview(userId: string, data: { productId: string, rating: number, title?: string, comment?: string }) {
    // Check if user has purchased the product
    const orderWithProduct = await ReviewRepository.findOrderWithProduct(userId, data.productId);

    return ReviewRepository.create({
      user: { connect: { id: userId } },
      product: { connect: { id: data.productId } },
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      isVerified: !!orderWithProduct
    });
  }

  static async getReviewsByProduct(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      ReviewRepository.findManyByProductId(productId, skip, limit),
      ReviewRepository.countByProductId(productId)
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
