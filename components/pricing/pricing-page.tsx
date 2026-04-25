'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'

interface PricingPageProps {
  user: any
}

const plans = [
  {
    name: 'Free',
    price: 'Free',
    description: 'Start streaming',
    features: [
      'Access to all movies and series',
      'Basic streaming quality',
      ' Limited to 1 device',
      'Community support',
    ],
    cta: 'Your Current Plan',
    disabled: true,
  },
  {
    name: 'Premium Monthly',
    price: '$9.99',
    period: '/month',
    description: 'Unlimited streaming',
    features: [
      'All Free features',
      '4K streaming',
      'Up to 4 devices',
      '24/7 Priority support',
      'Download for offline viewing',
      'Ad-free experience',
    ],
    cta: 'Subscribe Now',
    planId: 'premium_monthly',
  },
  {
    name: 'Premium Annual',
    price: '$99.99',
    period: '/year',
    description: 'Best value',
    features: [
      'All Premium Monthly features',
      'Save $20/year',
      'Exclusive content',
    ],
    cta: 'Subscribe Now',
    planId: 'premium_annual',
    highlighted: true,
  },
]

export function PricingPage({ user }: PricingPageProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleCheckout = async (planId: string) => {
    setLoading(planId)
    try {
      const response = await fetch('/api/paypal/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planId }),
      })

      if (!response.ok) {
        throw new Error('Checkout failed')
      }

      const { approvalLink } = await response.json()
      window.location.href = approvalLink
    } catch (error) {
      alert('Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />

      <main className="container mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-400">
            Choose the perfect plan for unlimited entertainment
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`border-slate-700 p-8 flex flex-col transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-blue-600/20 to-blue-600/5 border-blue-600 scale-105'
                  : 'bg-slate-800'
              } ${user?.subscription_status === 'premium' && plan.name === 'Premium Monthly' ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.highlighted && (
                <div className="mb-4 inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold w-fit">
                  Best Value
                </div>
              )}

              {user?.subscription_status === 'premium' && plan.name === 'Premium Monthly' && (
                <div className="mb-4 inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold w-fit">
                  Current Plan
                </div>
              )}

              <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
              <p className="text-slate-400 mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                {plan.period && (
                  <span className="text-slate-400 text-lg">{plan.period}</span>
                )}
              </div>

              <Button
                disabled={plan.disabled || loading !== null}
                className={`w-full h-12 mb-6 ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={() => {
                  if (plan.planId) {
                    handleCheckout(plan.planId)
                  }
                }}
              >
                {loading === plan.planId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.cta
                )}
              </Button>

              <div className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 space-y-8">
          <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Can I cancel anytime?</h3>
              <p className="text-slate-400">
                Yes, you can cancel your subscription at any time without any penalty.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Is there a free trial?</h3>
              <p className="text-slate-400">
                You have unlimited access to all content with your free account. Upgrade anytime.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">What payment methods do you accept?</h3>
              <p className="text-slate-400">
                We accept all major credit cards and PayPal.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Can I upgrade or downgrade?</h3>
              <p className="text-slate-400">
                Yes, you can change your plan at any time from your account settings.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
