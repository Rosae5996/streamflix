import { createServerSupabaseClient } from '@/lib/supabase/server'
import { removeSensitiveData } from './sanitizer'

export enum AuditEventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  CONTENT_CREATED = 'CONTENT_CREATED',
  CONTENT_UPDATED = 'CONTENT_UPDATED',
  CONTENT_DELETED = 'CONTENT_DELETED',
  FILE_UPLOADED = 'FILE_UPLOADED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  FAILED_AUTH = 'FAILED_AUTH',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

interface AuditLogEntry {
  event_type: AuditEventType
  user_id?: string
  ip_address?: string
  user_agent?: string
  resource_type?: string
  resource_id?: string
  changes?: any
  status: 'success' | 'failure'
  error_message?: string
  metadata?: any
  timestamp: Date
}

/**
 * Log security events to the database
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  options: {
    userId?: string
    ipAddress?: string
    userAgent?: string
    resourceType?: string
    resourceId?: string
    changes?: any
    status?: 'success' | 'failure'
    errorMessage?: string
    metadata?: any
  } = {}
) {
  try {
    const supabase = await createServerSupabaseClient()

    const entry: AuditLogEntry = {
      event_type: eventType,
      user_id: options.userId,
      ip_address: options.ipAddress,
      user_agent: options.userAgent,
      resource_type: options.resourceType,
      resource_id: options.resourceId,
      changes: options.changes ? removeSensitiveData(options.changes) : undefined,
      status: options.status || 'success',
      error_message: options.errorMessage,
      metadata: options.metadata,
      timestamp: new Date(),
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', JSON.stringify(entry, null, 2))
    }

    // Try to save to database
    // Note: You'll need to create an audit_logs table
    // const { error } = await supabase
    //   .from('audit_logs')
    //   .insert([entry])

    // if (error) {
    //   console.error('Failed to log audit event:', error)
    // }
  } catch (error) {
    console.error('Error logging audit event:', error)
  }
}

/**
 * Log failed authentication attempt
 */
export async function logFailedAuth(
  email: string,
  reason: string,
  ipAddress?: string
) {
  await logAuditEvent(AuditEventType.FAILED_AUTH, {
    status: 'failure',
    errorMessage: reason,
    ipAddress,
    metadata: { email: email.slice(0, 3) + '***' }, // Mask email
  })
}
