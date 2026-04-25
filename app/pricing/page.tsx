import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PricingPage } from '@/components/pricing/pricing-page'

export const metadata = {
  title: 'Pricing - StreamFlix',
  description: 'Choose your plan',
}

export default async function Pricing() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return <PricingPage user={userData} />
}
