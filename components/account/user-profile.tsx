'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface UserProfileProps {
  user: any
  authUser: any
}

export function UserProfile({ user, authUser }: UserProfileProps) {
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', authUser.id)

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' })
        setTimeout(() => {
          router.refresh()
        }, 1000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-slate-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="bg-slate-800 border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Your Profile</h1>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <Input
                type="email"
                value={authUser?.email}
                disabled
                className="bg-slate-700 border-slate-600 text-slate-300 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Subscription Status
              </label>
              <div className="p-4 bg-slate-700 rounded-lg">
                <p className="text-white capitalize font-medium">
                  {user?.subscription_status || 'free'}
                </p>
                {user?.subscription_expires_at && (
                  <p className="text-sm text-slate-400 mt-1">
                    Expires: {new Date(user.subscription_expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </>
  )
}
