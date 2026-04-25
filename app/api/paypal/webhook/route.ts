import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWebhook, getSubscriptionDetails } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    // Get webhook headers
    const transmissionId = request.headers.get('paypal-transmission-id')!
    const transmissionTime = request.headers.get('paypal-transmission-time')!
    const certUrl = request.headers.get('paypal-cert-url')!
    const transmissionSig = request.headers.get('paypal-transmission-sig')!
    const webhookId = request.headers.get('paypal-webhook-id')!

    const webhookBody = await request.text()

    // Verify webhook signature
    const isValid = await verifyWebhook(
      transmissionId,
      transmissionTime,
      certUrl,
      transmissionSig,
      webhookBody
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 403 }
      )
    }

    const event = JSON.parse(webhookBody)

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Handle subscription events
    if (event.event_type === 'BILLING.SUBSCRIPTION.CREATED') {
      const subscriptionId = event.resource.id
      const customId = event.resource.custom_id // User ID

      const subscriptionDetails = await getSubscriptionDetails(subscriptionId)

      // Save subscription
      await supabase.from('paypal_subscriptions').upsert([
        {
          user_id: customId,
          paypal_subscription_id: subscriptionId,
          plan_type: event.resource.plan_id.includes('annual') ? 'annual' : 'monthly',
          status: subscriptionDetails.status,
          started_at: subscriptionDetails.start_time || new Date(),
          expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days default
        },
      ])

      // Update user subscription status
      await supabase
        .from('users')
        .update({
          subscription_status: 'premium',
          subscription_expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
        })
        .eq('id', customId)
    }

    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscriptionId = event.resource.id
      const customId = event.resource.custom_id

      // Determine plan type and set expiration
      const subscriptionDetails = await getSubscriptionDetails(subscriptionId)
      const isAnnual = subscriptionDetails.billing_info?.next_billing_time ? 
        new Date(subscriptionDetails.billing_info.next_billing_time).getTime() - Date.now() > 200 * 24 * 60 * 60 * 1000
        : false

      const expiresAt = new Date(
        Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000
      )

      // Update subscription
      await supabase
        .from('paypal_subscriptions')
        .update({
          status: 'ACTIVE',
          expires_at: expiresAt,
        })
        .eq('paypal_subscription_id', subscriptionId)

      // Update user
      await supabase
        .from('users')
        .update({
          subscription_status: 'premium',
          subscription_expires_at: expiresAt,
        })
        .eq('id', customId)
    }

    if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
      const subscriptionId = event.resource.id
      const customId = event.resource.custom_id

      // Update subscription
      await supabase
        .from('paypal_subscriptions')
        .update({ status: 'CANCELLED' })
        .eq('paypal_subscription_id', subscriptionId)

      // Update user
      await supabase
        .from('users')
        .update({
          subscription_status: 'free',
          subscription_expires_at: null,
        })
        .eq('id', customId)
    }

    if (event.event_type === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
      // Handle failed payment
      const customId = event.resource.custom_id

      // You might want to send an email notification or update UI
      console.log(`Payment failed for user ${customId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
