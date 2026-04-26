'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ImpersonationSession {
  id: string
  admin_id: string
  admin: {
    email: string
    full_name: string
  }
  impersonated_user_id: string
  impersonated_user: {
    email: string
    full_name: string
    subscription_status: string
  }
  session_token: string
  started_at: string
  expires_at: string
  reason: string
  is_active: boolean
  ip_address: string
}

export default function ImpersonationManagement() {
  const [sessions, setSessions] = useState<ImpersonationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [impersonationReason, setImpersonationReason] = useState('')
  const [impersonating, setImpersonating] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/impersonate')
      const data = await response.json()

      if (data.success) {
        setSessions(data.sessions || [])
      } else {
        setError(data.error || 'Failed to fetch sessions')
      }
    } catch (err) {
      console.error('[v0] Error fetching sessions:', err)
      setError('Failed to load impersonation sessions')
    } finally {
      setLoading(false)
    }
  }

  async function handleStartImpersonation(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setImpersonating(true)

    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          reason: impersonationReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store the impersonation token
        localStorage.setItem('impersonation_session', JSON.stringify(data.session))
        // Refresh sessions
        fetchSessions()
        // Reset form
        setSelectedUserId('')
        setImpersonationReason('')
        alert('Impersonation session started. You are now viewing as this user.')
      } else {
        setError(data.error || 'Failed to start impersonation')
      }
    } catch (err) {
      console.error('[v0] Error starting impersonation:', err)
      setError('Failed to start impersonation')
    } finally {
      setImpersonating(false)
    }
  }

  async function handleEndSession(sessionId: string) {
    if (!confirm('End this impersonation session?')) return

    try {
      const response = await fetch(`/api/admin/impersonate/${sessionId}`, {
        method: 'PUT',
      })

      if (response.ok) {
        fetchSessions()
        const stored = localStorage.getItem('impersonation_session')
        if (stored) {
          const session = JSON.parse(stored)
          if (session.id === sessionId) {
            localStorage.removeItem('impersonation_session')
          }
        }
      }
    } catch (err) {
      console.error('[v0] Error ending session:', err)
      alert('Failed to end session')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary mx-auto"></div>
          <p className="text-foreground">Loading impersonation sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Impersonation</h1>
        <p className="text-foreground/60 mt-1">View the platform as a regular user to test access restrictions</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Start Impersonation</h2>
        <form onSubmit={handleStartImpersonation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              User ID or Email *
            </label>
            <Input
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="Enter user email or ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Reason for Impersonation
            </label>
            <Input
              value={impersonationReason}
              onChange={(e) => setImpersonationReason(e.target.value)}
              placeholder="e.g., Testing subscription access"
            />
          </div>

          <Button disabled={impersonating}>
            {impersonating ? 'Starting...' : 'Start Impersonation'}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Active Sessions</h2>
        {sessions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-foreground/60">No active impersonation sessions</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {session.admin.full_name} impersonating {session.impersonated_user.full_name}
                        </h3>
                        <p className="text-sm text-foreground/60">
                          Admin: {session.admin.email} → User: {session.impersonated_user.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-foreground/60">Reason: </span>
                        <span className="text-foreground">{session.reason || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-foreground/60">Started: </span>
                        <span className="text-foreground">{formatDate(session.started_at)}</span>
                      </div>
                      <div>
                        <span className="text-foreground/60">Expires: </span>
                        <span className="text-foreground">{formatDate(session.expires_at)}</span>
                      </div>
                      <div>
                        <span className="text-foreground/60">Subscription: </span>
                        <span className="text-foreground capitalize">{session.impersonated_user.subscription_status}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleEndSession(session.id)}
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    End
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
