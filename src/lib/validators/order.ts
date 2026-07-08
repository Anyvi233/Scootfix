import { z } from "zod";
import { ORDER_STATUSES } from "../constants";

export const addressSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(4, "ZIP/Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().optional(),
});

export const createOrderSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentId: z.string().optional(),
  notes: z.string().optional(),
  // We don't accept items from client to prevent price tampering.
  // We'll read from their DB cart.
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES as any),
});
