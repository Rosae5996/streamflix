import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
      .select('role, id')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create content' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type, // 'movie' or 'series'
      category_id,
      genre,
      rating,
      duration_minutes,
      release_year,
      release_date,
      director,
      cast,
      country,
      language = 'es',
      age_restriction = 0,
      is_free_to_watch = false,
      video_url,
      thumbnail_url,
      trailer_url,
      primary_quality = '1080p',
      number_of_seasons,
      episode_count,
      production_company,
      budget,
      revenue,
      is_published = false,
    } = body

    // Validate required fields
    if (!title || !type || !['movie', 'series'].includes(type)) {
      return NextResponse.json(
        { error: 'Title and valid type (movie/series) are required' },
        { status: 400 }
      )
    }

    // Create content record
    const { data: content, error: contentError } = await supabase
      .from('content')
      .insert({
        title,
        description,
        type,
        category_id,
        genre: Array.isArray(genre) ? genre : genre ? [genre] : [],
        rating: rating ? parseFloat(rating) : null,
        duration_minutes: duration_minutes ? parseInt(duration_minutes) : null,
        release_year: release_year ? parseInt(release_year) : null,
        release_date,
        director,
        cast: Array.isArray(cast) ? cast : cast ? [cast] : [],
        country,
        language,
        age_restriction: parseInt(age_restriction),
        is_free_to_watch,
        video_url,
        thumbnail_url,
        trailer_url,
        primary_quality,
        number_of_seasons: number_of_seasons ? parseInt(number_of_seasons) : null,
        episode_count: episode_count ? parseInt(episode_count) : null,
        production_company,
        budget: budget ? parseFloat(budget) : null,
        revenue: revenue ? parseFloat(revenue) : null,
        is_published,
        created_by: user.id,
      })
      .select()
      .single()

    if (contentError) {
      console.error('[v0] Content creation error:', contentError)
      return NextResponse.json(
        { error: `Failed to create content: ${contentError.message}` },
        { status: 500 }
      )
    }

    // If is_free_to_watch, create access rule
    if (is_free_to_watch) {
      const { error: accessError } = await supabase
        .from('content_access_rules')
        .insert({
          content_id: content.id,
          is_free: true,
          min_age_restriction: age_restriction,
        })

      if (accessError) {
        console.error('[v0] Access rule error:', accessError)
      }
    }

    // Log the creation
    await logAuditEvent(AuditEventType.CONTENT_CREATED, {
      userId: user.id,
      contentId: content.id,
      title,
      type,
      description: 'Content created via admin API',
    })

    return NextResponse.json(
      {
        success: true,
        content,
        message: `Content "${title}" created successfully. ID: ${content.id}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Content creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}

// GET: List all content (with filtering)
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const isPublished = searchParams.get('published')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase.from('content').select('*')

    if (type) {
      query = query.eq('type', type)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (isPublished) {
      query = query.eq('is_published', isPublished === 'true')
    }

    // If not admin, only show published content
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        query = query.eq('is_published', true)
      }
    } else {
      query = query.eq('is_published', true)
    }

    const { data: contents, error } = await query.limit(limit).order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch content: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: contents?.length || 0,
      contents: contents || [],
    })
  } catch (error) {
    console.error('[v0] Content listing error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
