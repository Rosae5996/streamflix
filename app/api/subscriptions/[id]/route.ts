import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logAuditEvent, AuditEventType } from '@/lib/security/audit-logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { status, cancel_reason, auto_renew } = body

    // Get subscription to verify ownership or admin access
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Check if user is admin or owner
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin' && subscription.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const updateData: Record<string, any> = {}
    if (status !== undefined) updateData.status = status
    if (cancel_reason !== undefined && status === 'canceled') {
      updateData.cancel_reason = cancel_reason
      updateData.canceled_at = new Date().toISOString()
    }
    if (auto_renew !== undefined) updateData.auto_renew = auto_renew

    const { data: updatedSubscription, error } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update subscription: ${error.message}` },
        { status: 500 }
      )
    }

    // Log in history if status changed
    if (status && status !== 'active') {
      await supabase.from('subscription_history').insert({
        user_subscription_id: params.id,
        user_id: subscription.user_id,
        action: status === 'canceled' ? 'canceled' : status,
        action_by: user.id,
        notes: cancel_reason || undefined,
      })

      // If canceled, update user's subscription_status to free
      if (status === 'canceled') {
        await supabase
          .from('users')
          .update({ subscription_status: 'free' })
          .eq('id', subscription.user_id)
      }
    }

    await logAuditEvent(AuditEventType.CONTENT_CREATED, {
      userId: user.id,
      description: `Updated subscription ${params.id}: ${status}`,
      subscriptionId: params.id,
    })

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: `Subscription ${status}`,
    })
  } catch (error) {
    console.error('[v0] Subscription update error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:plan_id(name, price_monthly, price_annual, max_quality, features)
      `)
      .eq('id', params.id)
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Check permission
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin' && subscription.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Fetch history if admin
    let history = null
    if (userData?.role === 'admin') {
      const { data: subHistory } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('user_subscription_id', params.id)
        .order('created_at', { ascending: false })

      history = subHistory
    }

    return NextResponse.json({
      success: true,
      subscription,
      history,
    })
  } catch (error) {
    console.error('[v0] Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
