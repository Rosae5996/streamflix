'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lock, LogIn, CreditCard } from 'lucide-react'

interface ContentAccessBlockerProps {
  contentTitle: string
  contentId: string
  requiresLogin?: boolean
  requiresSubscription?: boolean
  subscriptionPlans?: any[]
}

export function ContentAccessBlocker({
  contentTitle,
  contentId,
  requiresLogin = false,
  requiresSubscription = false,
  subscriptionPlans = [],
}: ContentAccessBlockerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-slate-800 border-slate-700 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-slate-700 p-4">
            <Lock className="h-12 w-12 text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Premium Content</h1>
          <p className="text-slate-400 text-lg">
            &quot;{contentTitle}&quot; requires a subscription to watch
          </p>
        </div>

        {requiresLogin ? (
          <div className="space-y-4">
            <p className="text-slate-300">Sign in to your account to access premium content</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        ) : requiresSubscription ? (
          <div className="space-y-4">
            <p className="text-slate-300">
              Choose a subscription plan below to unlock this content and more
            </p>

            {subscriptionPlans && subscriptionPlans.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-blue-500 transition-colors"
                  >
                    <h3 className="font-semibold text-white capitalize mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-400 mb-3">{plan.description}</p>
                    <div className="text-2xl font-bold text-white mb-3">
                      ${plan.price_monthly?.toFixed(2) || 'N/A'}
                      {plan.price_monthly && <span className="text-sm text-slate-400">/month</span>}
                    </div>
                    <ul className="text-sm text-slate-300 space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                        {plan.max_quality} quality
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                        {plan.max_concurrent_streams} concurrent streams
                      </li>
                    </ul>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscribe
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Link href="/pricing">
              <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700">
                View All Plans
              </Button>
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
