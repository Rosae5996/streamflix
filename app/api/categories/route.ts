import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    // Get active categories
    const { data: categories, error } = await supabase
      .from('content_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch categories: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: categories?.length || 0,
      categories: categories || [],
    })
  } catch (error) {
    console.error('[v0] Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
      return NextResponse.json({ error: 'Only admins can create categories' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, description, icon_url, color, display_order = 0 } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const { data: category, error } = await supabase
      .from('content_categories')
      .insert({
        name,
        slug,
        description,
        icon_url,
        color,
        display_order,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create category: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        category,
        message: `Category "${name}" created successfully`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Category creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
