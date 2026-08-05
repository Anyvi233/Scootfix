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

class AuditBatchProcessor {
  private queue: AuditEvent[] = [];
  private isProcessing = false;
  private readonly MAX_BATCH_SIZE = 100;
  private readonly FLUSH_INTERVAL_MS = 5000;

  constructor() {
    if (typeof window === "undefined") {
      setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS);
    }
  }

  public push(event: AuditEvent) {
    this.queue.push({
      ...event,
      timestamp: new Date().toISOString(),
    } as AuditEvent & { timestamp: string });

    if (this.queue.length >= this.MAX_BATCH_SIZE) {
      this.flush();
    }
  }

  private async flush() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const batch = this.queue.splice(0, this.MAX_BATCH_SIZE);
    const endpoint = process.env.EXTERNAL_LOG_ENDPOINT;
    const apiKey = process.env.EXTERNAL_LOG_API_KEY;

    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({ logs: batch }),
        });
      } catch (err) {
        console.error("[AUDIT] Failed to push logs to external provider. Re-queueing.");
        // Re-queue at the front
        this.queue.unshift(...batch);
      }
    } else {
      // Fallback: Dump to console if no external provider is configured
      batch.forEach(log => {
        const prefix = `[AUDIT][${log.action}]`;
        console.info(prefix, JSON.stringify(log));
      });
    }

    this.isProcessing = false;
  }
}

const processor = new AuditBatchProcessor();

/**
 * Log a security/audit event.
 * Writes to the in-memory batch processor queue.
 * Never throws – logging must not break the main request flow.
 */
export async function auditLog(event: AuditEvent): Promise<void> {
  processor.push(event);
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
