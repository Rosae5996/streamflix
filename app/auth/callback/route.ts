import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors
  if (error) {
    const errorUrl = new URL('/auth/login', request.url)
    errorUrl.searchParams.set('error', error_description || error)
    return NextResponse.redirect(errorUrl)
  }

  // If no code, redirect to login
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    const supabase = await createServerSupabaseClient()

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[v0] OAuth exchange error:', exchangeError)
      const errorUrl = new URL('/auth/login', request.url)
      errorUrl.searchParams.set('error', 'Failed to authenticate')
      return NextResponse.redirect(errorUrl)
    }

    // Get the user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if user profile exists
      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      // If no profile, create one
      if (!userProfile) {
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          role: 'user',
          subscription_status: 'free',
          is_email_verified: user.email_confirmed_at ? true : false,
        })

        if (insertError) {
          console.error('[v0] User profile creation error:', insertError)
        }

        // Create default user settings
        await supabase.from('user_settings').insert({
          user_id: user.id,
          preferred_language: 'es',
          theme: 'dark',
          notifications_enabled: true,
        })
      }
    }

    // Redirect to home or dashboard
    return NextResponse.redirect(new URL('/', request.url))
  } catch (err) {
    console.error('[v0] OAuth callback error:', err)
    const errorUrl = new URL('/auth/login', request.url)
    errorUrl.searchParams.set('error', 'An error occurred during authentication')
    return NextResponse.redirect(errorUrl)
  }
}
