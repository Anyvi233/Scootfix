import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  specifications: z.record(z.string(), z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    sortOrder: z.number().int().default(0)
  })).min(1, "At least one image is required"),
  compatibilities: z.array(z.object({
    vehicleModelId: z.string(),
    yearStart: z.number().int().optional(),
    yearEnd: z.number().int().optional(),
    notes: z.string().optional()
  })).optional()
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(12),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating_desc"]).default("newest"),
  isFeatured: z.coerce.boolean().optional(),
  vehicleModelId: z.string().optional(),
  year: z.coerce.number().int().optional()
});
