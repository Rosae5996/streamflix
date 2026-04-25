import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createSubscriptionForUser } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planType } = await request.json()

    // Plan IDs should be created in PayPal dashboard or via API
    const planIds: Record<string, string> = {
      premium_monthly: process.env.PAYPAL_PLAN_MONTHLY_ID!,
      premium_annual: process.env.PAYPAL_PLAN_ANNUAL_ID!,
    }

    if (!planIds[planType]) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    const returnUrl = `${request.headers.get('origin')}/payment/success`
    const { subscriptionId, approvalLink } = await createSubscriptionForUser(
      planIds[planType],
      user.id,
      returnUrl
    )

    return NextResponse.json({
      subscriptionId,
      approvalLink,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}
