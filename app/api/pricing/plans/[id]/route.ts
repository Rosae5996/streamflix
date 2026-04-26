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

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update pricing' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price_monthly,
      price_annual,
      max_concurrent_streams,
      max_quality,
      max_downloads_per_day,
      features,
      is_active,
    } = body

    // Get old values for history tracking
    const { data: oldPlan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', params.id)
      .single()

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price_monthly !== undefined) updateData.price_monthly = price_monthly ? parseFloat(price_monthly) : null
    if (price_annual !== undefined) updateData.price_annual = price_annual ? parseFloat(price_annual) : null
    if (max_concurrent_streams !== undefined) updateData.max_concurrent_streams = parseInt(max_concurrent_streams)
    if (max_quality !== undefined) updateData.max_quality = max_quality
    if (max_downloads_per_day !== undefined) updateData.max_downloads_per_day = parseInt(max_downloads_per_day)
    if (features !== undefined) updateData.features = features
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: plan, error } = await supabase
      .from('pricing_plans')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update pricing plan: ${error.message}` },
        { status: 500 }
      )
    }

    // Track price change in history if prices changed
    if (price_monthly !== undefined || price_annual !== undefined) {
      await supabase.from('pricing_history').insert({
        plan_id: params.id,
        old_price_monthly: oldPlan?.price_monthly,
        new_price_monthly: price_monthly ? parseFloat(price_monthly) : null,
        old_price_annual: oldPlan?.price_annual,
        new_price_annual: price_annual ? parseFloat(price_annual) : null,
        changed_by: user.id,
        change_reason: body.change_reason || 'Admin update',
        effective_date: new Date().toISOString(),
      })
    }

    await logAuditEvent(AuditEventType.CONTENT_CREATED, {
      userId: user.id,
      description: `Updated pricing plan: ${name || oldPlan?.name}`,
      planId: params.id,
      changes: updateData,
    })

    return NextResponse.json({
      success: true,
      plan,
      message: 'Pricing plan updated successfully',
    })
  } catch (error) {
    console.error('[v0] Pricing plan update error:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing plan' },
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

    const { data: plan, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !plan) {
      return NextResponse.json(
        { error: 'Pricing plan not found' },
        { status: 404 }
      )
    }

    // If admin, also fetch pricing history
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let history = null
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role === 'admin') {
        const { data: priceHistory } = await supabase
          .from('pricing_history')
          .select('*')
          .eq('plan_id', params.id)
          .order('created_at', { ascending: false })

        history = priceHistory
      }
    }

    return NextResponse.json({
      success: true,
      plan,
      history,
    })
  } catch (error) {
    console.error('[v0] Pricing plan fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plan' },
      { status: 500 }
    )
  }
}
