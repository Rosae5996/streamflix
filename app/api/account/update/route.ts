import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, password, currentPassword } = body

    // If changing password, verify current password
    if (password && currentPassword) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      })

      if (signInError) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Update email if provided
    if (email && email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email,
      })

      if (emailError) {
        return NextResponse.json(
          { error: emailError.message },
          { status: 400 }
        )
      }

      // Update users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ email })
        .eq('id', user.id)

      if (dbError) {
        return NextResponse.json(
          { error: 'Failed to update email in database' },
          { status: 400 }
        )
      }
    }

    // Update password if provided
    if (password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      })

      if (passwordError) {
        return NextResponse.json(
          { error: passwordError.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account updated successfully',
    })
  } catch (error) {
    console.error('[v0] Account update error:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}
