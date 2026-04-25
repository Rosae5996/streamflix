'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Film, Settings, Users, Home } from 'lucide-react'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin' },
  { icon: Film, label: 'Content', href: '/admin/content' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen sticky top-0">
      <nav className="p-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
