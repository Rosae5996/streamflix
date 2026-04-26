'use client'

import Link from 'next/link'
import { Film, Users, TrendingUp, DollarSign, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface NetflixAdminDashboardProps {
  contentCount: number
  usersCount: number
  activeSubscriptionsCount: number
  recentContent: any[]
  pricingPlans: any[]
}

export function NetflixAdminDashboard({
  contentCount,
  usersCount,
  activeSubscriptionsCount,
  recentContent,
  pricingPlans,
}: NetflixAdminDashboardProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back, Administrator</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Content Card */}
          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Total Content
                </p>
                <p className="text-4xl font-black text-white mt-2">{contentCount}</p>
                <p className="text-gray-500 text-xs mt-2">Videos in catalog</p>
              </div>
              <div className="w-14 h-14 bg-red-600/20 rounded-lg flex items-center justify-center">
                <Film className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </Card>

          {/* Users Card */}
          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Total Users
                </p>
                <p className="text-4xl font-black text-white mt-2">{usersCount}</p>
                <p className="text-gray-500 text-xs mt-2">Registered accounts</p>
              </div>
              <div className="w-14 h-14 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Subscriptions Card */}
          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Active Subscriptions
                </p>
                <p className="text-4xl font-black text-white mt-2">{activeSubscriptionsCount}</p>
                <p className="text-gray-500 text-xs mt-2">Paying customers</p>
              </div>
              <div className="w-14 h-14 bg-green-600/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Plans Card */}
          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Pricing Plans
                </p>
                <p className="text-4xl font-black text-white mt-2">{pricingPlans.length}</p>
                <p className="text-gray-500 text-xs mt-2">Active plans</p>
              </div>
              <div className="w-14 h-14 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Content Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Content</h2>
            <Link href="/admin/content/new">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentContent.length > 0 ? (
              recentContent.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/content/${item.id}`}
                  className="group"
                >
                  <Card className="bg-gray-900 border-gray-800 overflow-hidden hover:border-red-600/50 transition h-full">
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:from-gray-700 group-hover:to-gray-800 transition relative">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="h-8 w-8 text-gray-600" />
                      )}
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition flex items-center justify-center">
                        <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white line-clamp-2 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
                <Film className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No content yet</p>
                <Link href="/admin/content/new">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Create First Content
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/content/new" className="group">
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">Add Content</h3>
                    <p className="text-gray-400 text-sm">Upload new videos</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition" />
                </div>
              </Card>
            </Link>

            <Link href="/admin/pricing" className="group">
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">Manage Pricing</h3>
                    <p className="text-gray-400 text-sm">Edit plans & prices</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition" />
                </div>
              </Card>
            </Link>

            <Link href="/admin/users" className="group">
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">Manage Users</h3>
                    <p className="text-gray-400 text-sm">View all accounts</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition" />
                </div>
              </Card>
            </Link>

            <Link href="/admin/subscriptions" className="group">
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">Subscriptions</h3>
                    <p className="text-gray-400 text-sm">View active plans</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition" />
                </div>
              </Card>
            </Link>

            <Link href="/admin/audit-logs" className="group">
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">Audit Logs</h3>
                    <p className="text-gray-400 text-sm">View activity</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition" />
                </div>
              </Card>
            </Link>

            <Link href="/admin/impersonation" className="group">
              <Card className="bg-gray-900 border-gray-800 p-6 hover:border-red-600/50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">Impersonate</h3>
                    <p className="text-gray-400 text-sm">View as user</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition" />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Play icon component
function Play(props: any) {
  return (
    <svg
      {...props}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  )
}
