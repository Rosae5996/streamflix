import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ContentForm } from '@/components/admin/content-form'

export const metadata = {
  title: 'Edit Content - StreamFlix',
  description: 'Edit movie or series',
}

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
    .eq('id', id)
    .single()

  if (!content) {
    redirect('/admin/content')
  }

  return <ContentForm initialData={content} isEdit={true} />
}
