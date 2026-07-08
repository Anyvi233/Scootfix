import { z } from "zod";

export const createReturnSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
  items: z.array(z.object({
    orderItemId: z.string(),
    quantity: z.number().int().positive(),
    reason: z.string().optional()
  })).min(1, "At least one item is required")
});
