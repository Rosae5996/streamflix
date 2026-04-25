'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'

interface ContentManagementProps {
  initialContent: any[]
}

export function ContentManagement({ initialContent }: ContentManagementProps) {
  const [content, setContent] = useState(initialContent)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    setDeleting(id)
    try {
      const { error } = await supabase.from('content').delete().eq('id', id)

      if (error) {
        alert(`Error: ${error.message}`)
      } else {
        setContent(content.filter(item => item.id !== id))
        router.refresh()
      }
    } catch (err) {
      alert('An error occurred while deleting')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">Manage Content</h1>
              <p className="text-slate-400">Add, edit, and delete movies and series</p>
            </div>
            <Link href="/admin/content/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Content
              </Button>
            </Link>
          </div>

          {content.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-12 text-center">
              <p className="text-slate-400 mb-4">No content yet</p>
              <Link href="/admin/content/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Add Your First Content
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <Card
                  key={item.id}
                  className="bg-slate-800 border-slate-700 p-6 flex items-center justify-between hover:border-blue-500 transition"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {item.type === 'movie' ? 'Movie' : 'Series'}
                      </Badge>
                      {item.rating && (
                        <span className="text-sm text-slate-400">★ {item.rating}</span>
                      )}
                      <Badge
                        className={
                          item.is_published
                            ? 'bg-green-600'
                            : 'bg-slate-600'
                        }
                      >
                        {item.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/content/${item.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:bg-blue-500/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleting === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      {deleting === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
