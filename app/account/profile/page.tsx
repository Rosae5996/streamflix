import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NetflixNavbar } from '@/components/netflix/netflix-navbar'
import { AccountSettingsForm } from '@/components/account/account-settings-form'

export const metadata = {
  title: 'Account Settings | StreamFlix',
  description: 'Manage your account settings, email, and password',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-black">
      <NetflixNavbar />
      
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400 mb-12">Manage your account, email, and password</p>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 sticky top-20">
                <h2 className="text-lg font-bold text-white mb-6">Your Profile</h2>
                
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-6 mx-auto">
                  {user.email?.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Email</p>
                    <p className="text-white font-medium break-all text-sm mt-1">{user.email}</p>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Account Type</p>
                    <p className="text-white font-medium capitalize text-sm mt-1">
                      {userData?.role === 'admin' ? '👑 Administrator' : '👤 Member'}
                    </p>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Member Since</p>
                    <p className="text-white font-medium text-sm mt-1">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Form */}
            <div className="lg:col-span-3">
              <AccountSettingsForm user={user} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
