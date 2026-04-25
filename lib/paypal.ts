import axios from 'axios'

const PAYPAL_API_BASE = process.env.NEXT_PUBLIC_PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

let cachedAccessToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  cachedAccessToken = {
    token: response.data.access_token,
    expiresAt: Date.now() + response.data.expires_in * 1000,
  }

  return response.data.access_token
}

export async function createSubscriptionPlan(
  name: string,
  price: string,
  currency: string
): Promise<string> {
  const accessToken = await getAccessToken()

  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/billing/plans`,
    {
      product_id: process.env.PAYPAL_PRODUCT_ID,
      name,
      description: `StreamFlix ${name} Plan`,
      type: 'REGULAR',
      payment_preferences: {
        service_type: 'PREPAID',
        setup_fee: {
          value: '0',
          currency_code: currency,
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: '0',
      },
      billing_cycles: [
        {
          frequency: {
            interval_unit: name.includes('Annual') ? 'YEAR' : 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: price,
              currency_code: currency,
            },
          },
        },
      ],
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `plan-${Date.now()}`,
      },
    }
  )

  return response.data.id
}

export async function createSubscriptionForUser(
  planId: string,
  customId: string,
  returnUrl: string
): Promise<{ subscriptionId: string; approvalLink: string }> {
  const accessToken = await getAccessToken()

  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions`,
    {
      plan_id: planId,
      subscriber: {
        name: {
          given_name: 'Customer',
        },
        email_address: customId,
      },
      custom_id: customId,
      application_context: {
        brand_name: 'StreamFlix',
        locale: 'en-US',
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl,
        cancel_url: `${returnUrl}?cancelled=true`,
      },
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `sub-${Date.now()}`,
      },
    }
  )

  // Extract approval link
  const approvalLink = response.data.links.find(
    (link: any) => link.rel === 'approve'
  )?.href

  return {
    subscriptionId: response.data.id,
    approvalLink: approvalLink || '',
  }
}

export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  const accessToken = await getAccessToken()

  const response = await axios.get(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  return response.data
}

export async function cancelSubscription(
  subscriptionId: string,
  reason: string = 'User cancelled'
): Promise<void> {
  const accessToken = await getAccessToken()

  await axios.post(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    { reason },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

export async function verifyWebhook(
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  transmissionSig: string,
  webhookBody: string
): Promise<boolean> {
  const accessToken = await getAccessToken()

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: 'SHA256withRSA',
        transmission_sig: transmissionSig,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(webhookBody),
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('Webhook verification error:', error)
    return false
  }
}
