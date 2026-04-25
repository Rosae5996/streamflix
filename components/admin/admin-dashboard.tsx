'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Film, Users, Settings, Plus } from 'lucide-react'

interface AdminDashboardProps {
  contentCount: number
  usersCount: number
  settings: any[]
}

export function AdminDashboard({ contentCount, usersCount, settings }: AdminDashboardProps) {
  const maintenanceMode = settings.find(s => s.setting_key === 'maintenance_mode')?.setting_value === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage your StreamFlix platform</p>
          </div>

          {/* Maintenance Mode Alert */}
          {maintenanceMode && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-400">Maintenance Mode Active</p>
                <p className="text-sm text-yellow-300/80">Your platform is currently in maintenance mode. Users won&apos;t be able to access the app.</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Content</p>
                  <p className="text-3xl font-bold text-white mt-2">{contentCount}</p>
                </div>
                <Film className="h-12 w-12 text-blue-400" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-2">{usersCount}</p>
                </div>
                <Users className="h-12 w-12 text-green-400" />
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <p className="text-xl font-bold text-white mt-2">
                    {maintenanceMode ? 'Maintenance' : 'Online'}
                  </p>
                </div>
                <Settings className="h-12 w-12 text-orange-400" />
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/content/new">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Content
                </Button>
              </Link>

              <Link href="/admin/content">
                <Button variant="outline" className="w-full border-slate-600 text-slate-200 hover:bg-slate-700 h-12">
                  <Film className="mr-2 h-4 w-4" />
                  Manage Content
                </Button>
              </Link>

              <Link href="/admin/settings">
                <Button variant="outline" className="w-full border-slate-600 text-slate-200 hover:bg-slate-700 h-12">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
