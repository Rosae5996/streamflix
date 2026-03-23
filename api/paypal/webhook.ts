import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUBSCRIPTION_EVENTS = {
  ACTIVATED: "BILLING.SUBSCRIPTION.ACTIVATED",
  CANCELLED: "BILLING.SUBSCRIPTION.CANCELLED",
  EXPIRED: "BILLING.SUBSCRIPTION.EXPIRED",
  SUSPENDED: "BILLING.SUBSCRIPTION.SUSPENDED",
  PAYMENT_FAILED: "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  RENEWED: "BILLING.SUBSCRIPTION.RENEWED",
};

const PAYMENT_EVENTS = {
  COMPLETED: "PAYMENT.SALE.COMPLETED",
  REFUNDED: "PAYMENT.SALE.REFUNDED",
};

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE === "live" ? "api-m" : "api-m.sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const response = await fetch(`https://${mode}.paypal.com/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

async function verifyWebhookSignature(
  headers: Record<string, string | string[] | undefined>,
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("[PayPal] No PAYPAL_WEBHOOK_ID configured, skipping verification");
    return true;
  }

  const transmissionId = headers["paypal-transmission-id"];
  const transmissionTime = headers["paypal-transmission-time"];
  const certUrl = headers["paypal-cert-url"];
  const authAlgo = headers["paypal-auth-algo"];
  const transmissionSig = headers["paypal-transmission-sig"];

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    console.error("[PayPal] Missing required headers for signature verification");
    return false;
  }

  try {
    const mode = process.env.PAYPAL_MODE === "live" ? "api-m" : "api-m.sandbox";
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`https://${mode}.paypal.com/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    });

    const result = await response.json();
    return result.verification_status === "SUCCESS";
  } catch (error) {
    console.error("[PayPal] Signature verification failed:", error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    
    if (process.env.NODE_ENV === "production") {
      const isValid = await verifyWebhookSignature(req.headers, rawBody);
      if (!isValid) {
        console.error("[PayPal] Invalid webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const event = req.body;
    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[PayPal] Received event: ${eventType}`);

    const db = await import("../server/db");

    switch (eventType) {
      case SUBSCRIPTION_EVENTS.ACTIVATED:
      case SUBSCRIPTION_EVENTS.RENEWED: {
        const subscriptionId = resource.id;
        if (!subscriptionId) {
          return res.status(400).json({ error: "Missing subscription ID" });
        }

        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);

        await db.activateSubscriptionByPayPalId(subscriptionId, endDate);
        console.log(`[PayPal] Subscription ${subscriptionId} activated`);
        break;
      }

      case SUBSCRIPTION_EVENTS.CANCELLED:
      case SUBSCRIPTION_EVENTS.EXPIRED:
      case SUBSCRIPTION_EVENTS.SUSPENDED: {
        const subscriptionId = resource.id;
        if (subscriptionId) {
          const status = eventType === SUBSCRIPTION_EVENTS.CANCELLED ? "cancelled" : "expired";
          await db.cancelSubscriptionByPayPalId(subscriptionId, status);
          console.log(`[PayPal] Subscription ${subscriptionId} ${status}`);
        }
        break;
      }

      case SUBSCRIPTION_EVENTS.PAYMENT_FAILED: {
        const subscriptionId = resource.id;
        if (subscriptionId) {
          await db.markSubscriptionPaymentFailed(subscriptionId);
          console.log(`[PayPal] Subscription ${subscriptionId} payment failed`);
        }
        break;
      }

      case PAYMENT_EVENTS.COMPLETED: {
        const orderId = resource.parent_payment || resource.id;
        if (orderId) {
          await db.markPaymentCompleted(orderId);
          console.log(`[PayPal] Payment ${orderId} completed`);
        }
        break;
      }

      case PAYMENT_EVENTS.REFUNDED: {
        const orderId = resource.parent_payment || resource.id;
        if (orderId) {
          await db.markPaymentRefunded(orderId);
          console.log(`[PayPal] Payment ${orderId} refunded`);
        }
        break;
      }

      default:
        console.log(`[PayPal] Unhandled event type: ${eventType}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[PayPal] Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
