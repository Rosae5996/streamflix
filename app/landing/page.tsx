import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Shield, Zap } from 'lucide-react'

export const metadata = {
  title: 'StreamFlix - Your Premium Streaming Platform',
  description: 'Stream unlimited movies and series in stunning quality',
}

export default async function LandingPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 py-6 container mx-auto">
        <h1 className="text-2xl font-bold text-blue-400">StreamFlix</h1>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-6xl font-bold text-white text-balance">
            Your Entertainment Unlimited
          </h2>
          <p className="text-xl text-slate-400">
            Stream thousands of movies and series in stunning 4K quality. Cancel anytime.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-lg">
                <Play className="mr-2 h-5 w-5 fill-current" />
                Start Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <Card className="bg-slate-800/50 border-slate-700 p-8 space-y-4">
            <div className="bg-blue-600/20 w-fit p-3 rounded-lg">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">4K Streaming</h3>
            <p className="text-slate-400">
              Watch in stunning Ultra HD quality with supported devices
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-8 space-y-4">
            <div className="bg-blue-600/20 w-fit p-3 rounded-lg">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Secure Account</h3>
            <p className="text-slate-400">
              Your data is protected with enterprise-grade security
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-8 space-y-4">
            <div className="bg-blue-600/20 w-fit p-3 rounded-lg">
              <Play className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Watch Anywhere</h3>
            <p className="text-slate-400">
              Stream on multiple devices simultaneously with Premium
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>© {new Date().getFullYear()} StreamFlix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
