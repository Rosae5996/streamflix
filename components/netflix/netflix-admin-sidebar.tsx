'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Film,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  BarChart3,
  FileText,
  Key,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin', exact: true },
  { icon: Film, label: 'Content', href: '/admin/content' },
  { icon: DollarSign, label: 'Pricing', href: '/admin/pricing' },
  { icon: TrendingUp, label: 'Subscriptions', href: '/admin/subscriptions' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: FileText, label: 'Audit Logs', href: '/admin/audit-logs' },
  { icon: Key, label: 'Impersonate', href: '/admin/impersonation' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export function NetflixAdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-black border-r border-gray-800 overflow-y-auto transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
              SF
            </div>
            <div>
              <h1 className="text-white font-black text-lg">STREAMFLIX</h1>
              <p className="text-gray-500 text-xs">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== '/admin'

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-black/50">
          <p className="text-gray-500 text-xs">v1.0.0</p>
          <p className="text-gray-600 text-xs mt-2">
            © 2026 StreamFlix. All rights reserved.
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  )
}
