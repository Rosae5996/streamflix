import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/security/rate-limiter'
import { logAuditEvent, AuditEventType } from '@/lib/security/audit-logger'

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = checkRateLimit(`password-change:${ipAddress}`, 3, 60 * 60 * 1000)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many password change attempts. Try again later.' },
        { status: 429 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      await logAuditEvent(AuditEventType.FAILED_AUTH, {
        userId: user.id,
        status: 'failure',
        errorMessage: 'Incorrect password for password change',
        ipAddress,
      })
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`)
    }

    // Update last password change timestamp
    await supabase
      .from('users')
      .update({
        last_password_change: new Date(),
      })
      .eq('id', user.id)

    await logAuditEvent(AuditEventType.ACCOUNT_CHANGE, {
      userId: user.id,
      status: 'success',
      metadata: {
        changeType: 'password_changed',
      },
      ipAddress,
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
