'use client'

import Link from 'next/link'
import { useAuthContext } from '@/lib/context/auth-context'
import { Header } from '@/components/layout/header'
import { ContentGrid } from '@/components/content/content-grid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play } from 'lucide-react'

interface DashboardProps {
  user: any
  featuredContent: any[]
  sections?: any[]
}

export function Dashboard({ user, featuredContent, sections = [] }: DashboardProps) {
  const { userRole } = useAuthContext()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Welcome Section */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">
              Welcome back, {user?.full_name || user?.email}!
            </h1>
            <p className="text-slate-400">
              {user?.subscription_status === 'premium' 
                ? 'Enjoy unlimited access to our premium content'
                : 'Upgrade to Premium for unlimited access'}
            </p>
          </div>

          {user?.subscription_status !== 'premium' && (
            <Link href="/pricing">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Upgrade to Premium
              </Button>
            </Link>
          )}
        </section>

        {/* Admin Quick Links */}
        {userRole === 'admin' && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/content">
                <Card className="p-6 bg-slate-800 border-slate-700 hover:border-blue-500 transition cursor-pointer">
                  <h3 className="text-lg font-semibold text-white mb-2">Manage Content</h3>
                  <p className="text-slate-400 text-sm">Add, edit, or delete movies and series</p>
                </Card>
              </Link>

              <Link href="/admin/settings">
                <Card className="p-6 bg-slate-800 border-slate-700 hover:border-blue-500 transition cursor-pointer">
                  <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
                  <p className="text-slate-400 text-sm">Maintenance mode and site settings</p>
                </Card>
              </Link>

              <Link href="/admin/users">
                <Card className="p-6 bg-slate-800 border-slate-700 hover:border-blue-500 transition cursor-pointer">
                  <h3 className="text-lg font-semibold text-white mb-2">Users</h3>
                  <p className="text-slate-400 text-sm">View and manage user accounts</p>
                </Card>
              </Link>
            </div>
          </section>
        )}

        {/* Featured Content */}
        {featuredContent.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
            <ContentGrid content={featuredContent} />
          </section>
        )}

        {/* Sections */}
        {sections.map((section) => (
          <section key={section.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{section.name}</h2>
              <Link href={`/browse?section=${section.slug}`} className="text-blue-400 hover:text-blue-300 text-sm">
                View All →
              </Link>
            </div>
            <ContentGrid content={featuredContent.slice(0, 5)} />
          </section>
        ))}
      </main>
    </div>
  )
}
