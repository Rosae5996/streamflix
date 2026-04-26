'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Shield, User, Mail, Calendar, Lock } from 'lucide-react'

interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at: string
  full_name?: string
}

interface NetflixUsersManagementProps {
  initialUsers: User[]
}

export function NetflixUsersManagement({ initialUsers }: NetflixUsersManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all')

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-black pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-2">Users</h1>
          <p className="text-gray-400">Manage all user accounts</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800 p-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider">Total Users</p>
            <p className="text-3xl font-black text-white mt-2">{users.length}</p>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider">Members</p>
            <p className="text-3xl font-black text-white mt-2">
              {users.filter((u) => u.role === 'user').length}
            </p>
          </Card>
          <Card className="bg-gray-900 border-gray-800 p-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider">Administrators</p>
            <p className="text-3xl font-black text-white mt-2">
              {users.filter((u) => u.role === 'admin').length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-red-600"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'user', 'admin'] as const).map((role) => (
                <Button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  variant={filterRole === role ? 'default' : 'outline'}
                  className={
                    filterRole === role
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'border-gray-700 text-gray-400 hover:text-white hover:bg-gray-900'
                  }
                >
                  {role === 'all' && 'All Users'}
                  {role === 'user' && 'Members'}
                  {role === 'admin' && 'Admins'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-black/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-800/50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.full_name || user.email?.split('@')[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Mail className="h-4 w-4 text-gray-600" />
                          <span className="break-all">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold">
                              <Shield className="h-3 w-3" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold">
                              <User className="h-3 w-3" />
                              <span>Member</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          <Lock className="h-4 w-4" />
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <User className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-400">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm">
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </p>
        </div>
      </div>
    </div>
  )
}
