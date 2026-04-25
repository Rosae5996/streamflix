import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ContentManagement } from '@/components/admin/content-management'

export const metadata = {
  title: 'Manage Content - StreamFlix',
  description: 'Add, edit, and delete content',
}

export default async function ContentPage() {
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

  const { data: content } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false })

  return <ContentManagement initialContent={content || []} />
}
