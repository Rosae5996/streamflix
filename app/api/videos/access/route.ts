import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { contentId } = await request.json()

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      )
    }

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

    // Get content
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // If content is not published and user is not admin, deny access
    if (!content.is_published && user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Content not available' },
          { status: 404 }
        )
      }
    } else if (!content.is_published && !user) {
      return NextResponse.json(
        { error: 'Content not available' },
        { status: 404 }
      )
    }

    // Get access rules
    const { data: accessRules } = await supabase
      .from('content_access_rules')
      .select('*')
      .eq('content_id', contentId)

    // If no access rules or is_free = true, allow access
    if (!accessRules || accessRules.length === 0 || accessRules.some((rule) => rule.is_free)) {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        requiresSubscription: false,
        accessType: 'free',
      })
    }

    // If user is not logged in, deny access
    if (!user) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        requiresSubscription: true,
        accessType: 'premium',
        message: 'Please sign in to access this content',
      })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role === 'admin') {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        requiresSubscription: false,
        accessType: 'admin',
      })
    }

    // Check for active subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Check if subscription covers required plan
    if (subscription && subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at)
      if (expiresAt > new Date()) {
        // Check if subscription plan grants access to this content
        const requiredPlanIds = accessRules?.map((r) => r.required_plan_id) || []
        
        if (requiredPlanIds.includes(subscription.plan_id)) {
          return NextResponse.json({
            success: true,
            hasAccess: true,
            requiresSubscription: false,
            accessType: 'premium',
            subscription: {
              planId: subscription.plan_id,
              expiresAt: subscription.expires_at,
            },
          })
        }
      }
    }

    // No valid subscription, deny access
    return NextResponse.json({
      success: true,
      hasAccess: false,
      requiresSubscription: true,
      accessType: 'premium',
      message: 'Premium subscription required to access this content',
    })
  } catch (error) {
    console.error('[v0] Content access check error:', error)
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    )
  }
}

// GET: Get access info for a content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      )
    }

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

    // Get content with access rules
    const { data: content } = await supabase
      .from('content')
      .select(`
        *,
        access_rules:content_access_rules(*)
      `)
      .eq('id', contentId)
      .single()

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      content,
    })
  } catch (error) {
    console.error('[v0] Content access info error:', error)
    return NextResponse.json(
      { error: 'Failed to get access info' },
      { status: 500 }
    )
  }
}
