import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateTempAdminCredentials } from '@/lib/admin/temp-admin-generator'

export async function POST(request: NextRequest) {
  try {
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

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, fullName } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const credentials = await generateTempAdminCredentials(email, fullName)

    return NextResponse.json({
      success: true,
      credentials: {
        id: credentials.id,
        email: credentials.email,
        temporaryPassword: credentials.temporaryPassword,
        fullName: credentials.fullName,
        expiresAt: credentials.expiresAt,
      },
      message: 'Temporary admin credentials generated. User must change password on first login.',
    })
  } catch (error) {
    console.error('Create temp admin error:', error)
    return NextResponse.json(
      { error: 'Failed to create temporary admin credentials' },
      { status: 500 }
    )
  }
}
