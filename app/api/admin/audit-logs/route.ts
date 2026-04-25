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

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('content_audit_log')
      .select(
        `
        id,
        content_id,
        action_type,
        changed_by,
        previous_values,
        new_values,
        description,
        created_at,
        ip_address,
        users!changed_by(full_name)
      `
      )
      .eq('content_id', contentId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`)
    }

    const logs = (data || []).map((log: any) => ({
      id: log.id,
      contentId: log.content_id,
      actionType: log.action_type,
      changedBy: log.changed_by,
      changedByName: log.users?.full_name,
      previousValues: log.previous_values,
      newValues: log.new_values,
      description: log.description,
      createdAt: new Date(log.created_at),
      ipAddress: log.ip_address,
    }))

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Audit logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
