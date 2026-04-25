import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ContentDetail } from '@/components/content/content-detail'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single()

  return {
    title: content?.title || 'Content',
    description: content?.description || '',
  }
}

export default async function ContentDetailPage({
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

  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single()

  if (!content || !content.is_published) {
    redirect('/browse')
  }

  return <ContentDetail content={content} user={user} />
}
