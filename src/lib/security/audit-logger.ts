/**
 * @file src/lib/security/audit-logger.ts
 * @description Structured audit logging service.
 * Persists security-sensitive events (logins, role changes, deletions, etc.)
 * to the database AuditLog table and the server console.
 *
 * All events are immutable once written.
 */

import prisma from "@/lib/prisma";

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGIN_FAILED"
  | "USER_LOGOUT"
  | "USER_REGISTERED"
  | "USER_ROLE_CHANGED"
  | "USER_DELETED"
  | "PASSWORD_CHANGED"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DELETED"
  | "ORDER_STATUS_CHANGED"
  | "ORDER_CANCELLED"
  | "INVENTORY_ADJUSTED"
  | "COUPON_CREATED"
  | "COUPON_DELETED"
  | "ADMIN_ACCESS"
  | "UNAUTHORIZED_ACCESS_ATTEMPT"
  | "RATE_LIMIT_EXCEEDED"
  | "SUSPICIOUS_INPUT_DETECTED";

export interface AuditEvent {
  action: AuditAction;
  userId?: string;       // the actor performing the action (null = anonymous)
  targetId?: string;     // the resource being acted upon
  targetType?: string;   // e.g. "User", "Product", "Order"
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log a security/audit event.
 * Writes to the AuditLog DB table and the server console.
 * Never throws – logging must not break the main request flow.
 */
export async function auditLog(event: AuditEvent): Promise<void> {
  // Console log (always available, even without DB)
  const prefix = `[AUDIT][${event.action}]`;
  console.info(prefix, JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  }));

  try {
    await (prisma as any).auditLog.create({
      data: {
        action: event.action,
        userId: event.userId ?? null,
        targetId: event.targetId ?? null,
        targetType: event.targetType ?? null,
        description: event.description ?? null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
      },
    });
  } catch {
    // If DB write fails (e.g. table not yet migrated) we still have the console log.
    console.error("[AUDIT] Failed to write audit log to database.");
  }
}

/** Convenience helper for failed login attempts */
export async function logFailedLogin(email: string, ip?: string): Promise<void> {
  return auditLog({
    action: "USER_LOGIN_FAILED",
    description: `Failed login attempt for email: ${email}`,
    ipAddress: ip,
    metadata: { email },
  });
}

/** Convenience helper for successful logins */
export async function logSuccessfulLogin(userId: string, ip?: string): Promise<void> {
  return auditLog({
    action: "USER_LOGIN",
    userId,
    description: "Successful login",
    ipAddress: ip,
  });
}

/** Convenience helper for unauthorized access attempts */
export async function logUnauthorizedAccess(path: string, ip?: string, userId?: string): Promise<void> {
  return auditLog({
    action: "UNAUTHORIZED_ACCESS_ATTEMPT",
    userId,
    description: `Unauthorized access attempt to: ${path}`,
    ipAddress: ip,
    metadata: { path },
  });
}
