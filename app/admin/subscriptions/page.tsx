'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Subscription {
  id: string
  user_id: string
  user: {
    email: string
    full_name: string
  }
  plan: {
    name: string
    price_monthly: number | null
    price_annual: number | null
  }
  status: string
  payment_method: string
  started_at: string
  expires_at: string | null
  renewal_date: string | null
  auto_renew: boolean
  created_at: string
}

export default function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all') // all, active, canceled, expired

  useEffect(() => {
    fetchSubscriptions()
  }, [filter])

  async function fetchSubscriptions() {
    try {
      setLoading(true)
      const url = `/api/subscriptions${filter !== 'all' ? `?status=${filter}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setSubscriptions(data.subscriptions || [])
      } else {
        setError(data.error || 'Failed to fetch subscriptions')
      }
    } catch (err) {
      console.error('[v0] Error fetching subscriptions:', err)
      setError('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelSubscription(subscriptionId: string) {
    if (!confirm('Are you sure you want to cancel this subscription?')) return

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'canceled',
          cancel_reason: 'Admin canceled',
        }),
      })

      if (response.ok) {
        // Refresh subscriptions
        fetchSubscriptions()
      }
    } catch (err) {
      console.error('[v0] Error canceling subscription:', err)
      alert('Failed to cancel subscription')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-600',
      canceled: 'bg-red-500/20 text-red-600',
      expired: 'bg-orange-500/20 text-orange-600',
      paused: 'bg-yellow-500/20 text-yellow-600',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary mx-auto"></div>
          <p className="text-foreground">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-foreground/60 mt-1">Manage user subscriptions and billing</p>
        </div>
        <Link href="/admin/subscriptions/new">
          <Button>Add Subscription</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'canceled', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-background border border-input text-foreground hover:bg-accent'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-foreground/60">No subscriptions found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="p-4 hover:bg-background/80 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{sub.user?.full_name || 'Unknown'}</h3>
                      <p className="text-sm text-foreground/60">{sub.user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                    <div>
                      <span className="text-foreground/60">Plan: </span>
                      <span className="font-semibold text-foreground">{sub.plan?.name}</span>
                    </div>
                    <div>
                      <span className="text-foreground/60">Method: </span>
                      <span className="font-semibold text-foreground capitalize">{sub.payment_method}</span>
                    </div>
                    <div>
                      <span className="text-foreground/60">Started: </span>
                      <span className="font-semibold text-foreground">{formatDate(sub.started_at)}</span>
                    </div>
                    {sub.expires_at && (
                      <div>
                        <span className="text-foreground/60">Expires: </span>
                        <span className="font-semibold text-foreground">{formatDate(sub.expires_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                  <Link href={`/admin/subscriptions/${sub.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  {sub.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-500/10"
                      onClick={() => handleCancelSubscription(sub.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
