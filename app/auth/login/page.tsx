import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Login - StreamFlix',
  description: 'Sign in to your StreamFlix account',
}

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
