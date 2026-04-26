import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export const metadata = {
  title: 'Admin Dashboard - StreamFlix',
  description: 'Manage your streaming platform',
}

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get stats
  const { count: contentCount } = await supabase
    .from('content')
    .select('id', { count: 'exact', head: true })

  const { count: usersCount } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })

  const { count: activeSubscriptionsCount } = await supabase
    .from('user_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: pricingPlans } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)

  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')

  return (
    <AdminDashboard
      contentCount={contentCount || 0}
      usersCount={usersCount || 0}
      activeSubscriptionsCount={activeSubscriptionsCount || 0}
      pricingPlans={pricingPlans || []}
      settings={settings || []}
    />
  )
}
