export const metadata = {
  title: 'Maintenance - StreamFlix',
  description: 'We are currently under maintenance',
}

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-white">Under Maintenance</h1>
          <p className="text-xl text-slate-400">
            We&apos;re making StreamFlix even better. We&apos;ll be back soon!
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <p className="text-slate-300">
            We&apos;re currently performing scheduled maintenance to improve your experience.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <p className="text-slate-400">Maintenance in progress</p>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Please check back in a few minutes. Thank you for your patience!
        </p>
      </div>
    </div>
  )
}
