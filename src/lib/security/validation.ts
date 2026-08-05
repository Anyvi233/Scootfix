/**
 * @file src/lib/security/validation.ts
 * @description Zod-based input validation schemas and helpers.
 * 
 * Prisma already parameterises all queries, preventing SQL injection by design.
 * This layer adds:
 *   - Strong input validation (Zod schemas)
 *   - Dangerous pattern detection
 *   - Type-safe parsed output for every API handler
 */

import { z } from "zod";
import { NextResponse } from "next/server";

// ─── Dangerous Input Patterns ──────────────────────────────────────────────────

/** Patterns indicative of SQL injection or script injection attempts */
const DANGEROUS_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|EXEC|EXECUTE|UNION|CREATE|ALTER)\b)/gi,
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,  // onerror=, onclick=, etc.
  /data:\s*text\/html/gi,
];

export function containsDangerousInput(value: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
}

/** Check all string fields in an object for dangerous patterns */
export function hasDangerousFields(obj: Record<string, unknown>): boolean {
  for (const val of Object.values(obj)) {
    if (typeof val === "string" && containsDangerousInput(val)) return true;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      if (hasDangerousFields(val as Record<string, unknown>)) return true;
    }
  }
  return false;
}

// ─── Common Field Schemas ──────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .max(255, "Email too long");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password too long") // bcrypt max is 72 bytes
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name too long")
  .regex(/^[\w\s'-]+$/, "Name contains invalid characters");

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]{7,20}$/, "Invalid phone number")
  .optional();

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
  .max(100);

export const positiveIntSchema = z
  .number()
  .int()
  .positive("Must be a positive integer");

export const priceSchema = z
  .number()
  .positive("Price must be positive")
  .max(10_000_000, "Price exceeds maximum allowed value");

// ─── Auth Schemas ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(72),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── Product Schemas ──────────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(3).max(200),
  slug: slugSchema,
  description: z.string().min(10).max(5000),
  price: priceSchema,
  compareAtPrice: priceSchema.optional(),
  sku: z.string().min(2).max(50).regex(/^[A-Z0-9\-_]+$/i, "Invalid SKU format"),
  barcode: z.string().max(100).optional(),
  supplier: z.string().max(200).optional(),
  purchasePrice: z.number().min(0),
  lowStockThreshold: positiveIntSchema.default(5),
  stock: z.number().int().min(0),
  categoryId: z.string().cuid("Invalid category ID"),
  brandId: z.string().cuid("Invalid brand ID"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// ─── Address Schema ───────────────────────────────────────────────────────────

export const addressSchema = z.object({
  label: z.string().max(50).optional(),
  firstName: nameSchema,
  lastName: nameSchema,
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  zip: z.string().regex(/^[A-Z0-9\s\-]{3,10}$/i, "Invalid ZIP/postal code"),
  country: z.string().min(2).max(100),
  phone: phoneSchema,
  isDefault: z.boolean().default(false),
});

// ─── Review Schema ────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional(),
  comment: z.string().min(10).max(2000).optional(),
});

// ─── Helper: parse request body with schema ────────────────────────────────────

export async function parseBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await req.json();

    // Check for dangerous injection patterns
    if (hasDangerousFields(body)) {
      return {
        data: null,
        error: NextResponse.json(
          { success: false, error: "Suspicious input detected." },
          { status: 400 }
        ),
      };
    }

    const data = schema.parse(body);
    return { data, error: null };
  } catch (err: unknown) {
    const issues = (err as any)?.issues ?? [];
    const msg =
      issues[0]?.message ?? (err as any)?.message ?? "Invalid request body";
    return {
      data: null,
      error: NextResponse.json({ success: false, error: msg, issues }, { status: 422 }),
    };
  }
}
