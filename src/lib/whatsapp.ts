// WhatsApp notification helper
export const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || "";
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
export const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || "";

/**
 * Send a simple text WhatsApp message to the admin number.
 * Uses Meta's Cloud API. If any required env var is missing, it silently skips.
 */
export async function sendWhatsAppMessage(message: string): Promise<void> {
  if (!WHATSAPP_API_KEY || !WHATSAPP_PHONE_NUMBER_ID || !ADMIN_WHATSAPP_NUMBER) {
    console.log(`[WhatsApp] Config missing — skipping notification`);
    return;
  }
  const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: ADMIN_WHATSAPP_NUMBER,
    type: "text",
    text: { body: message },
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`[WhatsApp] Failed to send message:`, data);
    } else {
      console.log(`[WhatsApp] Notification sent`);
    }
  } catch (err) {
    console.error(`[WhatsApp] Error sending message:`, err);
  }
}
