import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    const { data, error } = await supabase
      .from('site_branding')
      .select('*')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch branding: ${error.message}`)
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Branding not found' },
        { status: 404 }
      )
    }

    const branding = {
      id: data.id,
      siteTitle: data.site_title,
      siteDescription: data.site_description,
      siteLogoUrl: data.site_logo_url,
      siteFaviconUrl: data.site_favicon_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      fontFamily: data.font_family,
      maintenanceMode: data.maintenance_mode,
      maintenanceMessage: data.maintenance_message,
    }

    return NextResponse.json({ branding })
  } catch (error) {
    console.error('Get branding error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()

    const { error } = await supabase
      .from('site_branding')
      .update({
        site_title: body.siteTitle,
        site_description: body.siteDescription,
        site_logo_url: body.siteLogoUrl,
        site_favicon_url: body.siteFaviconUrl,
        primary_color: body.primaryColor,
        secondary_color: body.secondaryColor,
        font_family: body.fontFamily,
        maintenance_mode: body.maintenanceMode,
        maintenance_message: body.maintenanceMessage,
        updated_by: user.id,
        updated_at: new Date(),
      })
      .limit(1)

    if (error) {
      throw new Error(`Failed to update branding: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Branding updated successfully',
    })
  } catch (error) {
    console.error('Update branding error:', error)
    return NextResponse.json(
      { error: 'Failed to update branding' },
      { status: 500 }
    )
  }
}
