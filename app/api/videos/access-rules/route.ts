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
      return NextResponse.json({ error: 'Only admins can view access rules' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')

    let query = supabase.from('content_access_rules').select(`
      *,
      content:content_id(title),
      plan:required_plan_id(name, price_monthly, price_annual)
    `)

    if (contentId) {
      query = query.eq('content_id', contentId)
    }

    const { data: rules, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch access rules: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: rules?.length || 0,
      rules: rules || [],
    })
  } catch (error) {
    console.error('[v0] Access rules fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access rules' },
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
      return NextResponse.json({ error: 'Only admins can create access rules' }, { status: 403 })
    }

    const body = await request.json()
    const {
      content_id,
      required_plan_id,
      is_trial_allowed = true,
      is_free = false,
      min_age_restriction = 0,
      geo_restrictions = [],
    } = body

    if (!content_id) {
      return NextResponse.json(
        { error: 'content_id is required' },
        { status: 400 }
      )
    }

    // If is_free, don't require a plan
    const planId = is_free ? null : required_plan_id

    const { data: rule, error } = await supabase
      .from('content_access_rules')
      .insert({
        content_id,
        required_plan_id: planId,
        is_trial_allowed,
        is_free,
        min_age_restriction: parseInt(min_age_restriction),
        geo_restrictions,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create access rule: ${error.message}` },
        { status: 500 }
      )
    }

    await logAuditEvent(AuditEventType.CONTENT_CREATED, {
      userId: user.id,
      description: `Created access rule for content ${content_id}`,
      ruleId: rule.id,
    })

    return NextResponse.json(
      {
        success: true,
        rule,
        message: 'Access rule created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Access rule creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create access rule' },
      { status: 500 }
    )
  }
}
