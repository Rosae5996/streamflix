'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface PricingPlan {
  id: string
  name: string
  description: string
  price_monthly: number | null
  price_annual: number | null
  max_concurrent_streams: number
  max_quality: string
  is_active: boolean
  display_order: number
}

export default function PricingManagement() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    try {
      setLoading(true)
      const response = await fetch('/api/pricing/plans')
      const data = await response.json()

      if (data.success) {
        setPlans(data.plans || [])
      } else {
        setError(data.error || 'Failed to fetch pricing plans')
      }
    } catch (err) {
      console.error('[v0] Error fetching plans:', err)
      setError('Failed to load pricing plans')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary mx-auto"></div>
          <p className="text-foreground">Loading pricing plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pricing Management</h1>
          <p className="text-foreground/60 mt-1">Manage subscription plans and pricing</p>
        </div>
        <Link href="/admin/pricing/new">
          <Button>Create New Plan</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {plans.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-foreground/60">No pricing plans found</p>
          <Link href="/admin/pricing/new" className="mt-4 inline-block">
            <Button>Create Your First Plan</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-4 hover:bg-background/80 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground capitalize">{plan.name}</h3>
                      <p className="text-sm text-foreground/60">{plan.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-foreground/60">Monthly: </span>
                      <span className="font-semibold text-foreground">
                        ${plan.price_monthly?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground/60">Annual: </span>
                      <span className="font-semibold text-foreground">
                        ${plan.price_annual?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground/60">Quality: </span>
                      <span className="font-semibold text-foreground">{plan.max_quality}</span>
                    </div>
                    <div>
                      <span className="text-foreground/60">Streams: </span>
                      <span className="font-semibold text-foreground">{plan.max_concurrent_streams}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.is_active
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-gray-500/20 text-gray-600'
                    }`}
                  >
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Link href={`/admin/pricing/${plan.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
