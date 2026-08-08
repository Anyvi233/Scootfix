import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Razorpay GET callback after Payment Link is paid.
 * Query params: razorpay_payment_id, razorpay_payment_link_id,
 *               razorpay_payment_link_reference_id,
 *               razorpay_payment_link_status, razorpay_signature
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const paymentId = searchParams.get("razorpay_payment_id") || "";
  const paymentLinkId = searchParams.get("razorpay_payment_link_id") || "";
  const paymentLinkRefId =
    searchParams.get("razorpay_payment_link_reference_id") || "";
  const paymentLinkStatus =
    searchParams.get("razorpay_payment_link_status") || "";
  const signature = searchParams.get("razorpay_signature") || "";

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // If payment failed or cancelled
  if (paymentLinkStatus !== "paid") {
    return NextResponse.redirect(
      `${siteUrl}/checkout?payment=failed`,
      { status: 302 }
    );
  }

  // Verify HMAC-SHA256 signature
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const body = `${paymentLinkId}|${paymentLinkRefId}|${paymentLinkStatus}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("Razorpay callback signature mismatch");
    return NextResponse.redirect(
      `${siteUrl}/checkout?payment=invalid`,
      { status: 302 }
    );
  }

  // Retrieve pending order context from reference_id (format: "order_<sessionKey>")
  // The paymentLinkRefId was set when we stored the pending order in session
  // Redirect to a page that will create the DB order
  return NextResponse.redirect(
    `${siteUrl}/checkout/confirm?payment_id=${paymentId}&ref=${paymentLinkRefId}`,
    { status: 302 }
  );
}
