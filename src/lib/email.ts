/**
 * email.ts — re-exports Resend-backed email functions for backward compatibility.
 * All actual implementation is in mailer.ts.
 */
export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAbandonedCartEmail,
  sendShippingEmail,
  sendAdminOrderAlert,
} from "./mailer";
