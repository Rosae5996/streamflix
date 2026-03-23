import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";
import logger from "../../server/_core/logger";

// PayPal webhook event types we care about
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

// Verify PayPal webhook signature
async function verifyWebhookSignature(
  headers: Record<string, string | string[] | undefined>,
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    logger.warn("No PAYPAL_WEBHOOK_ID configured, skipping verification", "PayPal");
    return true; // Skip verification in development
  }

  const transmissionId = headers["paypal-transmission-id"];
  const transmissionTime = headers["paypal-transmission-time"];
  const certUrl = headers["paypal-cert-url"];
  const authAlgo = headers["paypal-auth-algo"];
  const transmissionSig = headers["paypal-transmission-sig"];

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    logger.error("Missing required headers for signature verification", "PayPal");
    return false;
  }

  try {
    const mode = process.env.PAYPAL_MODE === "live" ? "api" : "api-m.sandbox";
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
    logger.error("Signature verification failed", "PayPal", undefined, error as Error);
    return false;
  }
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE === "live" ? "api" : "api-m.sandbox";

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

async function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  return drizzle(process.env.DATABASE_URL);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    
    // Verify webhook signature in production
    if (process.env.NODE_ENV === "production") {
      const isValid = await verifyWebhookSignature(req.headers, rawBody);
      if (!isValid) {
        logger.error("Invalid webhook signature", "PayPal");
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const event = req.body;
    const eventType = event.event_type;
    const resource = event.resource;

    logger.paypal(`Received event: ${eventType}`, { eventType, resourceId: resource?.id });

    const db = await getDb();

    // Handle subscription events
    switch (eventType) {
      case SUBSCRIPTION_EVENTS.ACTIVATED:
      case SUBSCRIPTION_EVENTS.RENEWED: {
        // Subscription was activated or renewed
        const subscriptionId = resource.id;
        const customId = resource.custom_id; // We store the planId here
        const subscriberEmail = resource.subscriber?.email_address;

        if (!subscriptionId) {
          logger.error("No subscription ID in event", "PayPal");
          return res.status(400).json({ error: "Missing subscription ID" });
        }

        // Find user by email or custom_id
        const planId = customId ? parseInt(customId) : null;
        
        // Calculate subscription period
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription

        // Update or create subscription
        // First, find if there's a pending subscription with this PayPal order
        await db.execute({
          sql: `
            UPDATE user_subscriptions 
            SET status = 'active', 
                paypal_subscription_id = ?,
                current_period_start = ?,
                current_period_end = ?,
                updated_at = NOW()
            WHERE paypal_order_id = ? OR paypal_subscription_id = ?
          `,
          args: [subscriptionId, now, endDate, subscriptionId, subscriptionId],
        });

        logger.paypal(`Subscription activated`, { subscriptionId });
        break;
      }

      case SUBSCRIPTION_EVENTS.CANCELLED:
      case SUBSCRIPTION_EVENTS.EXPIRED:
      case SUBSCRIPTION_EVENTS.SUSPENDED: {
        const subscriptionId = resource.id;
        
        // Mark subscription as cancelled/expired
        const status = eventType === SUBSCRIPTION_EVENTS.CANCELLED ? "cancelled" : "expired";
        
        await db.execute({
          sql: `
            UPDATE user_subscriptions 
            SET status = ?,
                updated_at = NOW()
            WHERE paypal_subscription_id = ?
          `,
          args: [status, subscriptionId],
        });

        logger.paypal(`Subscription ${status}`, { subscriptionId, status });
        break;
      }

      case SUBSCRIPTION_EVENTS.PAYMENT_FAILED: {
        const subscriptionId = resource.id;
        
        // Mark subscription as payment failed (suspended state)
        await db.execute({
          sql: `
            UPDATE user_subscriptions 
            SET status = 'past_due',
                updated_at = NOW()
            WHERE paypal_subscription_id = ?
          `,
          args: [subscriptionId],
        });

        logger.paypal(`Payment failed`, { subscriptionId });
        break;
      }

      case PAYMENT_EVENTS.COMPLETED: {
        // One-time payment completed
        const orderId = resource.parent_payment || resource.id;
        
        // Find and activate the subscription
        await db.execute({
          sql: `
            UPDATE user_subscriptions 
            SET status = 'active',
                current_period_start = NOW(),
                current_period_end = DATE_ADD(NOW(), INTERVAL 1 MONTH),
                updated_at = NOW()
            WHERE paypal_order_id = ?
          `,
          args: [orderId],
        });

        logger.paypal(`Payment completed`, { orderId });
        break;
      }

      case PAYMENT_EVENTS.REFUNDED: {
        const orderId = resource.parent_payment || resource.id;
        
        // Cancel the subscription on refund
        await db.execute({
          sql: `
            UPDATE user_subscriptions 
            SET status = 'refunded',
                updated_at = NOW()
            WHERE paypal_order_id = ?
          `,
          args: [orderId],
        });

        logger.paypal(`Payment refunded`, { orderId });
        break;
      }

      default:
        logger.info(`Unhandled PayPal event type: ${eventType}`, "PayPal");
    }

    // Acknowledge receipt of the webhook
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error("Error processing webhook", "PayPal", undefined, error as Error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
