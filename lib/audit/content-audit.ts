import { createServerSupabaseClient } from '@/lib/supabase/server'

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH'

export interface ContentAuditLog {
  id: string
  contentId: string
  actionType: AuditActionType
  changedBy: string
  changedByName?: string
  previousValues?: Record<string, any>
  newValues?: Record<string, any>
  description?: string
  createdAt: Date
  ipAddress?: string
}

export async function logContentChange(
  contentId: string,
  actionType: AuditActionType,
  previousValues?: Record<string, any>,
  newValues?: Record<string, any>,
  description?: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('content_audit_log').insert({
    content_id: contentId,
    action_type: actionType,
    changed_by: user.id,
    changes_json: newValues ? Object.keys(newValues) : null,
    previous_values: previousValues,
    new_values: newValues,
    description,
    ip_address: null,
  })

  if (error) {
    console.error('Failed to log content change:', error)
  }
}

export async function getContentAuditLog(
  contentId: string,
  limit: number = 50
): Promise<ContentAuditLog[]> {
  const supabase = await createServerSupabaseClient()

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
    .limit(limit)

  if (error) {
    console.error('Failed to fetch audit log:', error)
    return []
  }

  return (
    data?.map((log: any) => ({
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
    })) || []
  )
}

export async function revertContentChange(
  contentId: string,
  auditLogId: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { data: auditLog, error: auditError } = await supabase
    .from('content_audit_log')
    .select('previous_values')
    .eq('id', auditLogId)
    .single()

  if (auditError || !auditLog?.previous_values) {
    throw new Error('Failed to fetch audit log for revert')
  }

  const { error: updateError } = await supabase
    .from('content')
    .update(auditLog.previous_values)
    .eq('id', contentId)

  if (updateError) {
    throw new Error(`Failed to revert changes: ${updateError.message}`)
  }

  // Log the revert action
  await logContentChange(
    contentId,
    'UPDATE',
    undefined,
    auditLog.previous_values,
    `Reverted to previous state from audit log ${auditLogId}`
  )
}
