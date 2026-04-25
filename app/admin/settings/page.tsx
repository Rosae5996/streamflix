import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminSettings } from '@/components/admin/admin-settings'

export const metadata = {
  title: 'Admin Settings - StreamFlix',
  description: 'Configure your platform',
}

export default async function SettingsPage() {
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

  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')

  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <AdminSettings
      initialSettings={settings || []}
      initialSections={sections || []}
    />
  )
}
