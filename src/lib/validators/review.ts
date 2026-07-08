import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});
