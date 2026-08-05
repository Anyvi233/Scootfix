import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { getCurrentUser } from "./auth-helpers";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, errors?: unknown) {
  return NextResponse.json(
    { success: false, error: message, errors },
    { status }
  );
}

export async function withValidation<T>(
  req: Request,
  schema: ZodSchema<T>,
  handler: (data: T) => Promise<NextResponse>
) {
  try {
    const body = await req.json();
    const validatedData = schema.parse(body);
    return await handler(validatedData);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("Validation error", 400, error.issues);
    }
    return errorResponse("Invalid request body", 400);
  }
}

export async function withAuth(
  handler: (user: any) => Promise<NextResponse>
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    return await handler(user);
  } catch (error: unknown) {
    return errorResponse((error instanceof Error ? error.message : "An error occurred") || "Internal server error", 500);
  }
}

export async function withAdmin(
  handler: (user: any) => Promise<NextResponse>
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }
    return await handler(user);
  } catch (error: unknown) {
    return errorResponse((error instanceof Error ? error.message : "An error occurred") || "Internal server error", 500);
  }
}
