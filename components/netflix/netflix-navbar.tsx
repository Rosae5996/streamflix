'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Settings, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NetflixNavbar() {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    getUser()
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      setUser({ ...authUser, ...userData })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-gradient-to-b from-black/50 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-red-600 font-black text-2xl">STREAMFLIX</div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/browse" className="text-white hover:text-gray-300 transition">
              Browse
            </Link>
            <Link href="/my-list" className="text-white hover:text-gray-300 transition">
              My List
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-right">
                  <p className="text-white text-sm font-medium">{user.email}</p>
                  <p className="text-gray-400 text-xs">
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </p>
                </div>

                <div className="relative group">
                  <button className="w-10 h-10 bg-red-600 rounded-md flex items-center justify-center text-white font-bold hover:bg-red-700 transition">
                    {user.email?.charAt(0).toUpperCase()}
                  </button>

                  {/* Dropdown Menu */}
                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded-lg shadow-lg">
                    <Link
                      href="/account/profile"
                      className="block px-4 py-3 text-white hover:bg-gray-900 flex items-center space-x-2 border-b border-gray-700"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Account Settings</span>
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-white hover:bg-gray-900 flex items-center space-x-2 border-b border-gray-700"
                      >
                        <User className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-white hover:bg-gray-900 flex items-center space-x-2 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white ml-4"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-700">
            <Link href="/browse" className="block px-4 py-2 text-white hover:bg-gray-900">
              Browse
            </Link>
            <Link href="/my-list" className="block px-4 py-2 text-white hover:bg-gray-900">
              My List
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="block px-4 py-2 text-white hover:bg-gray-900">
                Admin Panel
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
