import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/security/rate-limiter'
import { logAuditEvent, AuditEventType } from '@/lib/security/audit-logger'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = checkRateLimit(`email-change:${ipAddress}`, 5, 60 * 60 * 1000)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many email change attempts. Try again later.' },
        { status: 429 }
      )
    }

    const { newEmail, password } = await request.json()

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

    // Verify password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })

    if (signInError) {
      await logAuditEvent(AuditEventType.FAILED_AUTH, {
        userId: user.id,
        status: 'failure',
        errorMessage: 'Incorrect password for email change',
        ipAddress,
      })
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Insert verification token
    const { error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: user.id,
        new_email: newEmail,
        token: verificationToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

    if (tokenError) {
      throw new Error(`Failed to create verification token: ${tokenError.message}`)
    }

    // TODO: Send verification email with token

    await logAuditEvent(AuditEventType.ACCOUNT_CHANGE, {
      userId: user.id,
      status: 'success',
      metadata: {
        changeType: 'email_change_requested',
        newEmail,
      },
      ipAddress,
    })

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    })
  } catch (error) {
    console.error('Change email error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
