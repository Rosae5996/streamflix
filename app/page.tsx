import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect based on user status
  if (!user) {
    redirect('/landing')
  } else {
    redirect('/dashboard')
  }
}
