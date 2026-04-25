import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { BrowsePage } from '@/components/browse/browse-page'

export const metadata = {
  title: 'Browse - StreamFlix',
  description: 'Browse all movies and series',
}

export default async function Browse() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get all published content
  const { data: allContent } = await supabase
    .from('content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Get sections
  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <BrowsePage
      initialContent={allContent || []}
      sections={sections || []}
    />
  )
}
