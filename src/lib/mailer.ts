import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // TLS (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

function buildOrderEmailHtml(data: OrderEmailData): string {
  const {
    orderNumber, customerName, items, subtotal,
    tax, shipping, total, paymentMethod, shippingAddress, createdAt,
  } = data;

  const dateStr = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const zip = shippingAddress.zipCode || shippingAddress.zip || "";
  const addressName = shippingAddress.name || customerName;

  const itemsHtml = items.map((item, i) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">
        ${i + 1}. ${item.name}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        ×${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #1e293b; font-size: 14px;">
        ₹${(item.price * item.quantity).toLocaleString("en-IN")}
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed – ScootFix</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Inter',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                SCOOT<span style="color:#60a5fa;">FIX</span>
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;font-weight:500;letter-spacing:1px;text-transform:uppercase;">
                Premium EV Spare Parts
              </p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-top:28px;display:block;margin-top:28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-size:20px;font-weight:700;color:#15803d;">✓ Order Confirmed!</p>
                          <p style="margin:6px 0 0;font-size:14px;color:#166534;">
                            Your order <strong>#${orderNumber}</strong> has been placed on ${dateStr}.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="background:#ffffff;padding:28px 40px 0;">
              <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">
                Hi <strong>${customerName}</strong>,<br/>
                Thank you for shopping with ScootFix! We've received your order and our team is already getting it ready for dispatch.
              </p>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="background:#ffffff;padding:28px 40px 0;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                Items Ordered
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="background:#ffffff;padding:20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px;">
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#64748b;">Subtotal</td>
                  <td style="padding:5px 0;font-size:13px;color:#1e293b;text-align:right;font-weight:500;">₹${subtotal.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#64748b;">${process.env.NEXT_PUBLIC_GST_NUMBER ? `GST (${process.env.NEXT_PUBLIC_GST_RATE || 18}%)` : 'Taxes &amp; Fees'}</td>
                  <td style="padding:5px 0;font-size:13px;color:#1e293b;text-align:right;font-weight:500;">${process.env.NEXT_PUBLIC_GST_NUMBER ? `₹${tax.toLocaleString("en-IN")}` : 'Incl. in price'}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#64748b;">Shipping</td>
                  <td style="padding:5px 0;font-size:13px;color:#1e293b;text-align:right;font-weight:500;">${shipping === 0 ? "FREE" : `₹${shipping.toLocaleString("en-IN")}`}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0 0;font-size:16px;font-weight:700;color:#0f172a;border-top:2px solid #e2e8f0;">Total Paid</td>
                  <td style="padding:14px 0 0;font-size:18px;font-weight:800;color:#2563eb;text-align:right;border-top:2px solid #e2e8f0;">₹${total.toLocaleString("en-IN")}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping & Payment Info -->
          <tr>
            <td style="background:#ffffff;padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-right:12px;">
                    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Deliver To</p>
                    <p style="margin:0;font-size:13px;color:#334155;line-height:1.7;">
                      <strong>${addressName}</strong><br/>
                      ${shippingAddress.street}<br/>
                      ${shippingAddress.city}, ${shippingAddress.state} – ${zip}
                      ${shippingAddress.phone ? `<br/>📞 ${shippingAddress.phone}` : ""}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align:top;padding-left:12px;border-left:1px solid #e2e8f0;">
                    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Payment</p>
                    <p style="margin:0;font-size:13px;color:#334155;line-height:1.7;">
                      ${paymentMethod}<br/>
                      <span style="display:inline-block;margin-top:6px;padding:3px 10px;background:#dcfce7;color:#15803d;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Confirmed</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px;text-align:center;">
              <a href="${process.env.NEXTAUTH_URL}/orders"
                style="display:inline-block;padding:14px 36px;background:#0f172a;color:#ffffff;font-size:14px;font-weight:700;border-radius:100px;text-decoration:none;letter-spacing:0.3px;">
                Track My Order →
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">
                Estimated delivery: 3–5 business days
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1e293b;border-radius:0 0 16px 16px;padding:28px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">
                Questions? Reply to this email or WhatsApp us at <strong style="color:#60a5fa;">+91 98765 43210</strong><br/>
                <span style="font-size:11px;">ScootFix EV Spares · Plot 45, HSR Layout, Bangalore – 560102</span>
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:#475569;">
                © ${new Date().getFullYear()} ScootFix. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  // If SMTP is not configured, log and skip silently
  if (!process.env.SMTP_USER || process.env.SMTP_USER === "your-email@gmail.com") {
    console.log(`[Email] SMTP not configured — skipping confirmation email for order ${data.orderNumber}`);
    return;
  }

  const html = buildOrderEmailHtml(data);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `ScootFix <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `✓ Order Confirmed – #${data.orderNumber} | ScootFix`,
    html,
  });

  console.log(`[Email] Confirmation sent to ${data.customerEmail} for order ${data.orderNumber}`);
}

export interface AbandonedCartEmailData {
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number; image?: string }[];
  cartUrl: string;
}

function buildAbandonedCartHtml(data: AbandonedCartEmailData): string {
  const { customerName, items, cartUrl } = data;

  const itemsHtml = items.map((item, i) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 500;">
        ${item.name}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
        Qty: ${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #1e293b; font-size: 14px;">
        ₹${item.price.toLocaleString("en-IN")}
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Items Left in Your Cart – ScootFix</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                SCOOT<span style="color:#60a5fa;">FIX</span>
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;font-weight:500;letter-spacing:1px;text-transform:uppercase;">
                Premium EV Spare Parts
              </p>
            </td>
          </tr>

          <!-- Greeting & Promo Card -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 0;border-radius:0;">
              <p style="margin:0 0 20px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;">
                Did you forget something?
              </p>
              <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">
                Hi <strong>${customerName}</strong>,<br/>
                We noticed you left some premium electric vehicle parts in your shopping cart. Don't let your ride wait! We've saved your cart so you can pick up exactly where you left off.
              </p>
              
              <!-- Special discount callout -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="background:#eff6ff;border:1.5px dashed #3b82f6;border-radius:12px;padding:20px;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#2563eb;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Special Limited Offer</p>
                    <p style="margin:6px 0 12px;font-size:16px;font-weight:700;color:#1e3a8a;">Take 10% OFF your entire cart order!</p>
                    <span style="display:inline-block;padding:8px 20px;background:#3b82f6;color:#ffffff;font-size:16px;font-weight:800;font-family:monospace;border-radius:6px;letter-spacing:1.5px;">CART10</span>
                    <p style="margin:10px 0 0;font-size:11px;color:#60a5fa;">Enter this code at checkout to claim your discount.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cart items list -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 0;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your Saved Cart</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px;text-align:center;">
              <a href="${cartUrl}"
                style="display:inline-block;padding:14px 36px;background:#0f172a;color:#ffffff;font-size:14px;font-weight:700;border-radius:100px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 10px 20px rgba(0,0,0,0.15);">
                Complete My Purchase →
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">
                Items are in high demand and not reserved.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1e293b;border-radius:0 0 16px 16px;padding:28px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">
                Need help finding the right parts? Reply to this email or WhatsApp us at <strong style="color:#60a5fa;">+91 98765 43210</strong><br/>
                <span style="font-size:11px;">ScootFix EV Spares · Plot 45, HSR Layout, Bangalore – 560102</span>
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:#475569;">
                © ${new Date().getFullYear()} ScootFix. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export async function sendAbandonedCartEmail(data: AbandonedCartEmailData): Promise<void> {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === "your-email@gmail.com") {
    console.log(`[Email] SMTP not configured — skipping abandoned cart email for ${data.customerEmail}`);
    return;
  }

  const html = buildAbandonedCartHtml(data);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `ScootFix <${process.env.SMTP_USER}>`,
    to: data.customerEmail,
    subject: `🛒 Don't let your ride wait – Complete your order! | ScootFix`,
    html,
  });

  console.log(`[Email] Abandoned cart reminder sent to ${data.customerEmail}`);
}
