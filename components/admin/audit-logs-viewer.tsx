'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, ChevronDown } from 'lucide-react'

interface AuditLog {
  id: string
  contentId: string
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH'
  changedBy: string
  changedByName?: string
  previousValues?: Record<string, any>
  newValues?: Record<string, any>
  description?: string
  createdAt: Date
}

interface AuditLogsViewerProps {
  contentId: string
}

export function AuditLogsViewer({ contentId }: AuditLogsViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reverting, setReverting] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditLogs()
  }, [contentId])

  const fetchAuditLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/audit-logs?contentId=${contentId}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  const handleRevert = async (logId: string) => {
    if (!confirm('Are you sure you want to revert to this version?')) return

    setReverting(logId)
    try {
      const response = await fetch('/api/admin/revert-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, auditLogId: logId }),
      })

      if (!response.ok) throw new Error('Failed to revert')
      await fetchAuditLogs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revert')
    } finally {
      setReverting(null)
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading audit logs...</div>
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg flex gap-2">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <p className="text-red-200">{error}</p>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No changes recorded yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Change History</h3>
        <Button
          onClick={fetchAuditLogs}
          variant="outline"
          size="sm"
          className="text-slate-300"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {logs.map((log) => (
        <Card key={log.id} className="p-4 bg-slate-800 border-slate-700">
          <div
            className="cursor-pointer flex items-center justify-between"
            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    log.actionType === 'DELETE'
                      ? 'bg-red-900/30 text-red-200'
                      : log.actionType === 'PUBLISH'
                        ? 'bg-green-900/30 text-green-200'
                        : log.actionType === 'UNPUBLISH'
                          ? 'bg-orange-900/30 text-orange-200'
                          : 'bg-blue-900/30 text-blue-200'
                  }`}
                >
                  {log.actionType}
                </span>
                <span className="text-slate-300">{log.changedByName || 'Admin'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-slate-400 transition-transform ${
                expandedId === log.id ? 'rotate-180' : ''
              }`}
            />
          </div>

          {expandedId === log.id && (
            <div className="mt-4 space-y-4 border-t border-slate-700 pt-4">
              {log.description && (
                <div>
                  <p className="text-sm font-medium text-slate-300">Description</p>
                  <p className="text-sm text-slate-400">{log.description}</p>
                </div>
              )}

              {log.previousValues && Object.keys(log.previousValues).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-2">Changes</p>
                  <div className="space-y-2 text-sm">
                    {Object.entries(log.previousValues).map(([key, oldValue]) => {
                      const newValue = log.newValues?.[key]
                      return (
                        <div key={key} className="flex gap-2">
                          <span className="font-mono text-red-400">
                            - {oldValue}
                          </span>
                          <span className="font-mono text-green-400">
                            + {newValue}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {log.actionType !== 'DELETE' && (
                <Button
                  onClick={() => handleRevert(log.id)}
                  disabled={reverting === log.id}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {reverting === log.id ? 'Reverting...' : 'Revert to This Version'}
                </Button>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
