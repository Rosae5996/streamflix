'use client'

import { Header } from '@/components/layout/header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface UsersManagementProps {
  initialUsers: any[]
}

export function UsersManagement({ initialUsers }: UsersManagementProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Users</h1>
            <p className="text-slate-400">Manage user accounts</p>
          </div>

          {initialUsers.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-12 text-center">
              <p className="text-slate-400">No users yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {initialUsers.map((user) => (
                <Card
                  key={user.id}
                  className="bg-slate-800 border-slate-700 p-6 hover:border-blue-500 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {user.full_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          className={
                            user.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'
                          }
                        >
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                        <Badge
                          className={
                            user.subscription_status === 'premium'
                              ? 'bg-green-600'
                              : 'bg-slate-600'
                          }
                        >
                          {user.subscription_status === 'premium'
                            ? 'Premium'
                            : 'Free'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        Joined{' '}
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
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
