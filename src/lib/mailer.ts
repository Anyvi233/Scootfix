/**
 * ScootFix â€” Resend Email Provider
 *
 * All transactional emails (order confirmation, password reset,
 * email verification, shipping) go through Resend.
 *
 * FREE TIER: 3,000 emails/month, no credit card required.
 * Sign up at: https://resend.com
 *
 * ENV VARS REQUIRED:
 *   RESEND_API_KEY    = re_xxxxxxxxxxxx   (from resend.com â†’ API Keys)
 *   RESEND_FROM       = ScootFix <orders@yourdomain.com>
 *                       (use "onboarding@resend.dev" for testing before domain setup)
 *   ADMIN_EMAIL       = your-personal@gmail.com  (where YOU get order alerts)
 */

import { Resend } from "resend";

// â”€â”€â”€ Resend client (lazy singleton) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// NOT created at module load â€” only when actually sending an email.
// This prevents the route from crashing when RESEND_API_KEY is not yet set.
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/** The address ScootFix sends FROM.
 *  During development/testing you can use the Resend sandbox address. */
const FROM =
  process.env.RESEND_FROM ||
  "ScootFix <onboarding@resend.dev>";

/** The admin email that receives order alerts. */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

// â”€â”€â”€ Guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function isConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 1.  ORDER CONFIRMATION  (sent to the customer)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    zip?: string;
    phone?: string;
  };
  createdAt: string;
}

function buildOrderHtml(data: OrderEmailData): string {
  const { orderNumber, customerName, items, subtotal, tax, shipping, total, paymentMethod, shippingAddress, createdAt } = data;
  const dateStr = new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const zip = shippingAddress.zipCode || shippingAddress.zip || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${item.name}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:14px;">×${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;font-size:14px;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Order Confirmed – ScootFix</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
        <p style="margin:0;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;">SCOOT<span style="color:#60a5fa;">FIX</span></p>
        <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Premium EV Spare Parts</p>
      </td></tr>

      <!-- Success banner -->
      <tr><td style="background:#fff;padding:28px 40px 0;">
        <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:20px 24px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#15803d;">✓ Order Confirmed!</p>
          <p style="margin:6px 0 0;font-size:14px;color:#166534;">Your order <strong>#${orderNumber}</strong> was placed on ${dateStr}.</p>
        </div>
      </td></tr>

      <!-- Greeting -->
      <tr><td style="background:#fff;padding:24px 40px 0;">
        <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">Hi <strong>${customerName}</strong>,<br/>Thank you for shopping with ScootFix! We've received your order and our team is getting it ready for dispatch.</p>
      </td></tr>

      <!-- Items -->
      <tr><td style="background:#fff;padding:24px 40px 0;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
        <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
      </td></tr>

      <!-- Totals -->
      <tr><td style="background:#fff;padding:20px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px;">
          <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Subtotal</td><td style="padding:4px 0;font-size:13px;color:#1e293b;text-align:right;font-weight:500;">₹${subtotal.toLocaleString("en-IN")}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Shipping</td><td style="padding:4px 0;font-size:13px;text-align:right;font-weight:500;color:#1e293b;">${shipping === 0 ? "FREE" : `₹${shipping.toLocaleString("en-IN")}`}</td></tr>
          <tr><td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#0f172a;border-top:2px solid #e2e8f0;">Total Paid</td><td style="padding:12px 0 0;font-size:18px;font-weight:800;color:#2563eb;text-align:right;border-top:2px solid #e2e8f0;">₹${total.toLocaleString("en-IN")}</td></tr>
        </table>
      </td></tr>

      <!-- Address & Payment -->
      <tr><td style="background:#fff;padding:24px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="vertical-align:top;padding-right:12px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Deliver To</p>
              <p style="margin:0;font-size:13px;color:#334155;line-height:1.7;"><strong>${shippingAddress.name}</strong><br/>${shippingAddress.street}<br/>${shippingAddress.city}, ${shippingAddress.state} – ${zip}${shippingAddress.phone ? `<br/>📞 ${shippingAddress.phone}` : ""}</p>
            </td>
            <td width="50%" style="vertical-align:top;padding-left:12px;border-left:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Payment</p>
              <p style="margin:0;font-size:13px;color:#334155;">${paymentMethod}<br/><span style="display:inline-block;margin-top:6px;padding:3px 10px;background:#dcfce7;color:#15803d;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;">Confirmed</span></p>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- CTA -->
      <tr><td style="background:#fff;padding:32px 40px;text-align:center;">
        <a href="${siteUrl}/orders" style="display:inline-block;padding:14px 36px;background:#0f172a;color:#fff;font-size:14px;font-weight:700;border-radius:100px;text-decoration:none;">Track My Order →</a>
        <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;">Estimated delivery: 3–5 business days</p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#1e293b;border-radius:0 0 16px 16px;padding:28px 40px;text-align:center;">
        <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">Questions? WhatsApp us at <strong style="color:#60a5fa;">+91 79077 04541</strong><br/><span style="font-size:11px;">ScootFix EV Spares · Bangalore, India</span></p>
        <p style="margin:14px 0 0;font-size:11px;color:#475569;">© ${new Date().getFullYear()} ScootFix. All rights reserved.</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  if (!isConfigured()) {
    console.log(`[Email] RESEND_API_KEY not set — skipping order confirmation for #${data.orderNumber}`);
    return;
  }
  const { error } = await getResend().emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `✓ Order Confirmed – #${data.orderNumber} | ScootFix`,
    html: buildOrderHtml(data),
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  console.log(`[Email] ✓ Order confirmation sent to ${data.customerEmail} (#${data.orderNumber})`);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 2.  ADMIN ORDER ALERT  (sent to YOU when a new order arrives)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export async function sendAdminOrderAlert(data: OrderEmailData): Promise<void> {
  if (!isConfigured() || !ADMIN_EMAIL) return;

  const itemsList = data.items.map((i) => `• ${i.name} ×${i.quantity} = ₹${(i.price * i.quantity).toLocaleString("en-IN")}`).join("\n");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🛒 New Order #${data.orderNumber} — ₹${data.total.toLocaleString("en-IN")} | ScootFix`,
    html: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;padding:32px;background:#f8fafc;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 16px;color:#0f172a;">🛒 New Order Received</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      <tr><td style="padding:4px 0;color:#64748b;">Order #</td><td style="font-weight:700;color:#0f172a;">${data.orderNumber}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Customer</td><td>${data.customerName} — ${data.customerEmail}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Amount</td><td style="font-weight:700;color:#2563eb;font-size:16px;">₹${data.total.toLocaleString("en-IN")}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">Payment</td><td>${data.paymentMethod}</td></tr>
      <tr><td style="padding:4px 0;color:#64748b;">City</td><td>${data.shippingAddress.city}, ${data.shippingAddress.state}</td></tr>
    </table>
    <p style="margin:16px 0 8px;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Items</p>
    <pre style="margin:0;font-size:13px;color:#334155;line-height:1.8;white-space:pre-wrap;">${itemsList}</pre>
    <div style="margin-top:20px;">
      <a href="${siteUrl}/admin/orders" style="display:inline-block;padding:10px 24px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">View in Admin Panel →</a>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error(`[Email] Admin alert failed: ${error.message}`);
  else console.log(`[Email] ✓ Admin order alert sent to ${ADMIN_EMAIL}`);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 3.  EMAIL VERIFICATION  (sent when user registers)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const verificationUrl = `${siteUrl}/api/auth/verify?token=${token}`;

  if (!isConfigured()) {
    console.log(`[Email] RESEND_API_KEY not set — verification link: ${verificationUrl}`);
    return;
  }

  const { error } = await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email – ScootFix",
    html: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:40px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">SCOOT<span style="color:#60a5fa;">FIX</span></p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 12px;color:#0f172a;">Verify your email address</h2>
      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">Welcome to ScootFix! Click the button below to confirm your email address and activate your account.</p>
      <div style="text-align:center;">
        <a href="${verificationUrl}" style="display:inline-block;padding:14px 32px;background:#10b981;color:#fff;border-radius:100px;text-decoration:none;font-size:14px;font-weight:700;">Verify My Email →</a>
      </div>
      <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;text-align:center;">This link expires in 24 hours. If you didn't create a ScootFix account, ignore this email.</p>
    </div>
  </div>
</body></html>`,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  console.log(`[Email] ✓ Verification email sent to ${email}`);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 4.  PASSWORD RESET  (sent when user clicks Forgot Password)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${siteUrl}/reset-password?token=${token}`;

  if (!isConfigured()) {
    console.log(`[Email] RESEND_API_KEY not set — reset link: ${resetUrl}`);
    return;
  }

  const { error } = await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Reset your ScootFix password",
    html: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:40px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">SCOOT<span style="color:#60a5fa;">FIX</span></p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 12px;color:#0f172a;">Password Reset Request</h2>
      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">We received a request to reset your ScootFix password. Click below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
      <div style="text-align:center;">
        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#0f172a;color:#fff;border-radius:100px;text-decoration:none;font-size:14px;font-weight:700;">Reset My Password →</a>
      </div>
      <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;text-align:center;">If you didn't request this, your account is safe — just ignore this email.</p>
    </div>
  </div>
</body></html>`,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  console.log(`[Email] ✓ Password reset email sent to ${email}`);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 5.  ABANDONED CART REMINDER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export interface AbandonedCartEmailData {
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  cartUrl: string;
}

export async function sendAbandonedCartEmail(data: AbandonedCartEmailData): Promise<void> {
  if (!isConfigured()) {
    console.log(`[Email] RESEND_API_KEY not set — skipping abandoned cart for ${data.customerEmail}`);
    return;
  }

  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;">${item.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#64748b;">×${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;color:#1e293b;">₹${item.price.toLocaleString("en-IN")}</td>
    </tr>`).join("");

  const { error } = await getResend().emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: "🛒 You left something behind! Complete your order – ScootFix",
    html: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px 16px;">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">SCOOT<span style="color:#60a5fa;">FIX</span></p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;color:#0f172a;">Did you forget something?</h2>
      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">Hi <strong>${data.customerName}</strong>, your EV parts are waiting! Complete your order before they sell out.</p>
      <div style="background:#eff6ff;border:1.5px dashed #3b82f6;border-radius:10px;padding:16px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:12px;color:#2563eb;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Limited Time Offer</p>
        <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#1e3a8a;">10% OFF your order</p>
        <span style="display:inline-block;padding:6px 18px;background:#3b82f6;color:#fff;font-size:15px;font-weight:800;font-family:monospace;border-radius:6px;letter-spacing:1.5px;">CART10</span>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">${itemsHtml}</table>
      <div style="text-align:center;">
        <a href="${data.cartUrl}" style="display:inline-block;padding:14px 32px;background:#0f172a;color:#fff;border-radius:100px;text-decoration:none;font-size:14px;font-weight:700;">Complete My Purchase →</a>
      </div>
    </div>
    <div style="background:#1e293b;padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">Questions? WhatsApp <strong style="color:#60a5fa;">+91 79077 04541</strong></p>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error(`[Email] Abandoned cart email failed: ${error.message}`);
  else console.log(`[Email] ✓ Abandoned cart email sent to ${data.customerEmail}`);
}

export async function sendShippingEmail(toEmail: string, orderNumber: string, trackingUrl: string): Promise<void> {
  if (!isConfigured()) {
    console.log(`[Email] RESEND_API_KEY not set — skipping shipping email for ${toEmail}`);
    return;
  }

  const { error } = await getResend().emails.send({
    from: FROM,
    to: toEmail,
    subject: `🚚 Your ScootFix Order #${orderNumber} Has Shipped!`,
    html: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px 16px;">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">SCOOT<span style="color:#60a5fa;">FIX</span></p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;color:#0f172a;">Your Order is on the Way! 🚚</h2>
      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">Good news! Your ScootFix order <strong>#${orderNumber}</strong> has been shipped and is heading your way.</p>
      
      <div style="background:#f1f5f9;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Tracking Details</p>
        <p style="margin:0 0 16px;font-size:14px;color:#0f172a;">Click the button below to track your delivery progress live.</p>
        <a href="${trackingUrl}" target="_blank" style="display:inline-block;padding:12px 28px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700;box-shadow:0 4px 6px -1px rgba(59,130,246,0.2);">Track Shipment ➔</a>
      </div>
      
      <p style="margin:0;color:#475569;font-size:13px;line-height:1.6;">If you have any questions or need help with your shipment, don't hesitate to reach out to our support team.</p>
    </div>
    <div style="background:#1e293b;padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">Questions? WhatsApp <strong style="color:#60a5fa;">+91 79077 04541</strong></p>
    </div>
  </div>
</body></html>`,
  });
  if (error) console.error(`[Email] Shipping email failed: ${error.message}`);
  else console.log(`[Email] ✓ Shipping email sent to ${toEmail}`);
}

