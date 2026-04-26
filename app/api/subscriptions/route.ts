import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logAuditEvent, AuditEventType } from '@/lib/security/audit-logger'

// GET user's subscription or get all subscriptions (admin)
export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    // If admin, can fetch all subscriptions
    if (userData?.role === 'admin') {
      let query = supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:plan_id(name, price_monthly, price_annual, max_quality),
          user:user_id(email, full_name)
        `)

      if (userId) {
        query = query.eq('user_id', userId)
      }
      if (status) {
        query = query.eq('status', status)
      }

      const { data: subscriptions, error } = await query.order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch subscriptions: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        count: subscriptions?.length || 0,
        subscriptions: subscriptions || [],
      })
    }

    // Regular users can only see their own subscription
    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:plan_id(name, price_monthly, price_annual, max_quality, features)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch subscription: ${error.message}` },
        { status: 500 }
      )
    }

    const subscription = subscriptions?.[0] || null

    return NextResponse.json({
      success: true,
      subscription,
      hasActiveSubscription: subscription && subscription.status === 'active' && (!subscription.expires_at || new Date(subscription.expires_at) > new Date()),
    })
  } catch (error) {
    console.error('[v0] Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

// POST: Create or update subscription (admin only)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can manage subscriptions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      user_id,
      plan_id,
      status = 'active',
      payment_method = 'paypal',
      payment_id,
      started_at = new Date().toISOString(),
      expires_at,
      renewal_date,
      auto_renew = true,
    } = body

    if (!user_id || !plan_id) {
      return NextResponse.json(
        { error: 'user_id and plan_id are required' },
        { status: 400 }
      )
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single()

    // If exists, cancel it first
    if (existingSubscription) {
      await supabase
        .from('user_subscriptions')
        .update({ status: 'canceled', canceled_at: new Date().toISOString() })
        .eq('id', existingSubscription.id)

      // Log in history
      await supabase.from('subscription_history').insert({
        user_id,
        action: 'canceled',
        action_by: user.id,
        notes: 'Replaced by new subscription',
      })
    }

    // Create new subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id,
        plan_id,
        status,
        payment_method,
        payment_id,
        started_at,
        expires_at,
        renewal_date,
        auto_renew,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create subscription: ${error.message}` },
        { status: 500 }
      )
    }

    // Log in history
    await supabase.from('subscription_history').insert({
      user_subscription_id: subscription.id,
      user_id,
      new_plan_id: plan_id,
      action: 'created',
      action_by: user.id,
    })

    // Update user's subscription_status in users table
    await supabase
      .from('users')
      .update({
        subscription_status: status === 'active' ? 'premium' : 'free',
        subscription_expires_at: expires_at,
      })
      .eq('id', user_id)

    await logAuditEvent(AuditEventType.CONTENT_CREATED, {
      userId: user.id,
      description: `Created subscription for user ${user_id}`,
      subscriptionId: subscription.id,
      planId: plan_id,
    })

    return NextResponse.json(
      {
        success: true,
        subscription,
        message: 'Subscription created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
