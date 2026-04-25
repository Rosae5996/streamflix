import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Payment Successful - StreamFlix',
  description: 'Your subscription has been activated',
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription_id?: string; cancelled?: string }>
}) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const isCancelled = params.cancelled === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 p-8 max-w-md w-full text-center space-y-6">
        {isCancelled ? (
          <>
            <div className="flex justify-center">
              <div className="bg-red-500/20 p-4 rounded-full">
                <span className="text-4xl">✕</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Cancelled</h1>
            <p className="text-slate-400">
              Your subscription was not completed. You can try again anytime.
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
            <p className="text-slate-400">
              Welcome to StreamFlix Premium! Your subscription is now active and you have unlimited access to all content.
            </p>
          </>
        )}

        <Link href="/dashboard" className="block">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12">
            {isCancelled ? 'Back to Pricing' : 'Go to Dashboard'}
          </Button>
        </Link>

        {!isCancelled && (
          <p className="text-xs text-slate-400">
            Subscription ID: {params.subscription_id}
          </p>
        )}
      </Card>
    </div>
  )
}
