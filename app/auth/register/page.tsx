import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata = {
  title: 'Sign Up | StreamFlix',
  description: 'Create a new StreamFlix account',
}

export default async function RegisterPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-black">
            SF
          </div>
          <h1 className="text-2xl font-black text-white">STREAMFLIX</h1>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-black/70 border border-gray-800 rounded-lg p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Sign Up</h2>
              <p className="text-gray-400">Create your account to start watching</p>
            </div>

            <RegisterForm />

            <div className="text-center text-gray-400 text-sm">
              <p>
                Already have an account?{' '}
                <Link href="/auth/login" className="text-red-600 hover:text-red-500 font-bold transition">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-8">
            By signing up, you agree to our{' '}
            <Link href="#" className="hover:text-gray-400 transition">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="#" className="hover:text-gray-400 transition">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
