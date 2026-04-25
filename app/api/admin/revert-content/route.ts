import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    const { contentId, auditLogId } = await request.json()

    if (!contentId || !auditLogId) {
      return NextResponse.json(
        { error: 'contentId and auditLogId are required' },
        { status: 400 }
      )
    }

    // Get the audit log
    const { data: auditLog, error: auditError } = await supabase
      .from('content_audit_log')
      .select('previous_values')
      .eq('id', auditLogId)
      .eq('content_id', contentId)
      .single()

    if (auditError || !auditLog?.previous_values) {
      return NextResponse.json(
        { error: 'Audit log not found or no previous values available' },
        { status: 404 }
      )
    }

    // Update content with previous values
    const { error: updateError } = await supabase
      .from('content')
      .update(auditLog.previous_values)
      .eq('id', contentId)

    if (updateError) {
      throw new Error(`Failed to revert content: ${updateError.message}`)
    }

    // Log the revert action
    const { error: logError } = await supabase
      .from('content_audit_log')
      .insert({
        content_id: contentId,
        action_type: 'UPDATE',
        changed_by: user.id,
        previous_values: auditLog.previous_values,
        new_values: auditLog.previous_values,
        description: `Reverted to previous state from audit log ${auditLogId}`,
      })

    if (logError) {
      console.error('Failed to log revert action:', logError)
    }

    return NextResponse.json({
      success: true,
      message: 'Content reverted successfully',
    })
  } catch (error) {
    console.error('Revert content error:', error)
    return NextResponse.json(
      { error: 'Failed to revert content' },
      { status: 500 }
    )
  }
}
