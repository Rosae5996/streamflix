import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { logAuditEvent, AuditEventType } from '@/lib/security/audit-logger'

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
      return NextResponse.json({ error: 'Only admins can impersonate users' }, { status: 403 })
    }

    const body = await request.json()
    const { user_id: impersonatedUserId, reason } = body

    if (!impersonatedUserId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Verify impersonated user exists
    const { data: impersonatedUser } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', impersonatedUserId)
      .single()

    if (!impersonatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex')

    // Create impersonation session
    const { data: session, error: sessionError } = await supabase
      .from('admin_impersonation_sessions')
      .insert({
        admin_id: user.id,
        impersonated_user_id: impersonatedUserId,
        session_token: sessionToken,
        reason,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown',
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour
      })
      .select()
      .single()

    if (sessionError) {
      console.error('[v0] Impersonation session creation error:', sessionError)
      return NextResponse.json(
        { error: `Failed to create impersonation session: ${sessionError.message}` },
        { status: 500 }
      )
    }

    // Log the impersonation
    await logAuditEvent(AuditEventType.UNAUTHORIZED_ACCESS, {
      userId: user.id,
      description: `Admin impersonating user: ${impersonatedUser.email}`,
      impersonationSessionId: session.id,
      reason,
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        token: sessionToken,
        impersonatedUser: {
          id: impersonatedUser.id,
          email: impersonatedUser.email,
          full_name: impersonatedUser.full_name,
        },
        expiresAt: session.expires_at,
      },
      message: `Impersonating ${impersonatedUser.email}`,
    })
  } catch (error) {
    console.error('[v0] Impersonation error:', error)
    return NextResponse.json(
      { error: 'Failed to impersonate user' },
      { status: 500 }
    )
  }
}

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
      return NextResponse.json({ error: 'Only admins can view impersonation sessions' }, { status: 403 })
    }

    // Get active impersonation sessions
    const { data: sessions, error } = await supabase
      .from('admin_impersonation_sessions')
      .select(`
        *,
        admin:admin_id(email, full_name),
        impersonated_user:impersonated_user_id(email, full_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch sessions: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
    })
  } catch (error) {
    console.error('[v0] Sessions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
