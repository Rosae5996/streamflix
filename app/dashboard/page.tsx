import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NetflixNavbar } from '@/components/netflix/netflix-navbar'
import { Dashboard } from '@/components/dashboard/dashboard'

export const metadata = {
  title: 'Dashboard | StreamFlix',
  description: 'Your personal streaming dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user info
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get featured content
  const { data: featuredContent } = await supabase
    .from('content')
    .select('*')
    .eq('is_published', true)
    .limit(5)

  // Get sections with content
  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <>
      <NetflixNavbar />
      <Dashboard user={userData} featuredContent={featuredContent || []} sections={sections || []} />
    </>
  )
}
