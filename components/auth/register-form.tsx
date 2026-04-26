'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2, Chrome } from 'lucide-react'
import { registerSchema } from '@/lib/schemas/auth'
import { ZodError } from 'zod'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate input with Zod
      registerSchema.parse({
        email,
        password,
        confirmPassword: password,
        fullName,
      })

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            role: 'user',
          },
        ])

        if (profileError) {
          setError(profileError.message)
          return
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 1500)
      }
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message || 'Validation failed')
      } else {
        setError('An unexpected error occurred')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setOauthLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setOauthLoading(false)
      }
    } catch (err) {
      console.error('[v0] Google sign-up error:', err)
      setError('Failed to sign up with Google')
      setOauthLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md space-y-6 p-8 bg-slate-800 border-slate-700 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Account Created</h1>
          <p className="text-slate-400">
            Please verify your email and sign in to continue.
          </p>
        </div>
        <p className="text-sm text-slate-500">Redirecting to login...</p>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md space-y-6 p-8 bg-slate-800 border-slate-700">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-slate-400">Join StreamFlix today</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        {error && (
          <div className="flex gap-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-200">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-200">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-200">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading || oauthLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={loading || oauthLoading}
        variant="outline"
        className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
      >
        {oauthLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </>
        )}
      </Button>

      <div className="text-center text-sm">
        <span className="text-slate-400">Already have an account? </span>
        <Link href="/auth/login" className="font-medium text-blue-400 hover:text-blue-300">
          Sign In
        </Link>
      </div>
    </Card>
  )
}
