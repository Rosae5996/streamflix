import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NetflixAdminSidebar } from '@/components/netflix/netflix-admin-sidebar'
import { NetflixAdminDashboard } from '@/components/netflix/netflix-admin-dashboard'

export const metadata = {
  title: 'Admin Dashboard | StreamFlix',
  description: 'Manage your streaming platform',
}

export default async function AdminPage() {
  const supabase = await createClient()

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
    redirect('/')
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

  const { data: recentContent } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: pricingPlans } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)

  return (
    <div className="flex min-h-screen bg-black">
      <NetflixAdminSidebar />
      
      <main className="flex-1 md:ml-64">
        <NetflixAdminDashboard
          contentCount={contentCount || 0}
          usersCount={usersCount || 0}
          activeSubscriptionsCount={activeSubscriptionsCount || 0}
          recentContent={recentContent || []}
          pricingPlans={pricingPlans || []}
        />
      </main>
    </div>
  )
}
