import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Shield, Zap, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'StreamFlix - Unlimited Streaming',
  description: 'Watch thousands of movies and series in stunning quality',
}

export default async function LandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-black">
              SF
            </div>
            <h1 className="text-2xl font-black text-white hidden sm:block">STREAMFLIX</h1>
          </Link>
          <div className="flex gap-3 sm:gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:text-gray-300">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20 pb-12 flex items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-black to-black" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-red-600/20 border border-red-600/50 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-red-500" />
            <span className="text-sm font-bold text-red-400">New Content Every Week</span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white text-balance leading-tight">
            Your Entertainment
            <br />
            <span className="text-red-600">Unlimited</span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto text-balance">
            Stream thousands of movies and series in stunning 4K quality. No hidden fees. Cancel anytime.
          </p>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth/register">
              <Button className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 text-lg font-bold rounded-lg group">
                <Play className="mr-2 h-5 w-5 fill-current group-hover:scale-110 transition" />
                Start Watching
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 h-12 px-8 text-lg font-bold rounded-lg">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 pt-4">
            Free trial for 30 days, then $12.99/month. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-black text-white text-center mb-16">Why StreamFlix?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gray-900/50 border-gray-800 p-8 hover:border-red-600/50 transition">
            <div className="bg-red-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">4K Streaming</h3>
            <p className="text-gray-400">
              Watch in stunning Ultra HD and HDR quality with supported devices
            </p>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-8 hover:border-red-600/50 transition">
            <div className="bg-red-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Secure & Private</h3>
            <p className="text-gray-400">
              Your data is protected with enterprise-grade encryption
            </p>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-8 hover:border-red-600/50 transition">
            <div className="bg-red-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Play className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Watch Everywhere</h3>
            <p className="text-gray-400">
              Stream on phones, tablets, laptops, and smart TVs
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Jobs</Link></li>
                <li><Link href="#" className="hover:text-white transition">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition">Twitter</Link></li>
                <li><Link href="#" className="hover:text-white transition">Instagram</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} StreamFlix, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
