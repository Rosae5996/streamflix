import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logAuditEvent, AuditEventType } from '@/lib/security/audit-logger'

export async function POST(request: NextRequest) {
  try {
    const { fullName } = await request.json()

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

    // Update user profile
    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        updated_at: new Date(),
      })
      .eq('id', user.id)

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    await logAuditEvent(AuditEventType.ACCOUNT_CHANGE, {
      userId: user.id,
      status: 'success',
      metadata: {
        changeType: 'profile_updated',
        fullName,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
