import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logAuditEvent, AuditEventType } from '@/lib/security/audit-logger'

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

    // Get active pricing plans
    const { data: plans, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch pricing plans: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: plans?.length || 0,
      plans: plans || [],
    })
  } catch (error) {
    console.error('[v0] Pricing plans fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}

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
      return NextResponse.json({ error: 'Only admins can manage pricing' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price_monthly,
      price_annual,
      max_concurrent_streams = 1,
      max_quality = '1080p',
      max_downloads_per_day = 0,
      features = {},
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      )
    }

    const { data: plan, error } = await supabase
      .from('pricing_plans')
      .insert({
        name,
        description,
        price_monthly: price_monthly ? parseFloat(price_monthly) : null,
        price_annual: price_annual ? parseFloat(price_annual) : null,
        max_concurrent_streams: parseInt(max_concurrent_streams),
        max_quality,
        max_downloads_per_day: parseInt(max_downloads_per_day),
        features,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create pricing plan: ${error.message}` },
        { status: 500 }
      )
    }

    await logAuditEvent(AuditEventType.CONTENT_CREATED, {
      userId: user.id,
      description: `Created pricing plan: ${name}`,
      planId: plan.id,
    })

    return NextResponse.json(
      {
        success: true,
        plan,
        message: `Pricing plan "${name}" created successfully`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Pricing plan creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create pricing plan' },
      { status: 500 }
    )
  }
}
