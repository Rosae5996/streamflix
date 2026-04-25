'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LogOut, User, Settings } from 'lucide-react'

export function Header() {
  const { user, userRole, signOut } = useAuthContext()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-2xl font-bold text-blue-400">
          StreamFlix
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
            Home
          </Link>
          <Link href="/browse" className="text-slate-300 hover:text-white transition">
            Browse
          </Link>
          {userRole === 'admin' && (
            <Link href="/admin" className="text-slate-300 hover:text-white transition">
              Admin
            </Link>
          )}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              {user?.email}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <Link href="/account/profile">Profile</Link>
            </DropdownMenuItem>
            {userRole === 'admin' && (
              <>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-200 focus:bg-slate-700 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <Link href="/admin/settings">Admin Settings</Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              className="text-red-400 focus:bg-slate-700 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
