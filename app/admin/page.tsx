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
  const { data: contentCount } = await supabase
    .from('content')
    .select('id')
    .then((r) => ({ data: r.data?.length || 0 }))

  const { data: usersCount } = await supabase
    .from('users')
    .select('id')
    .then((r) => ({ data: r.data?.length || 0 }))

  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')

  return (
    <AdminDashboard
      contentCount={contentCount}
      usersCount={usersCount}
      settings={settings || []}
    />
  )
}
