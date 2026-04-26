import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NetflixAdminSidebar } from '@/components/netflix/netflix-admin-sidebar'
import { NetflixUsersManagement } from '@/components/netflix/netflix-users-management'

export const metadata = {
  title: 'Users | StreamFlix',
  description: 'Manage users',
}

export default async function UsersPage() {
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

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-black">
      <NetflixAdminSidebar />
      <main className="flex-1 md:ml-64">
        <NetflixUsersManagement initialUsers={users || []} />
      </main>
    </div>
  )
}
