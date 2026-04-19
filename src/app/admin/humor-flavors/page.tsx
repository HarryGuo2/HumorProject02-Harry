import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HumorFlavorsView from './HumorFlavorsView'

export default async function HumorFlavorsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) {
    redirect('/unauthorized')
  }

  const { data: flavorsRaw, error } = await supabase.rpc('admin_humor_flavors_with_stats')
  if (error) {
    console.error('admin_humor_flavors_with_stats error:', error)
  }

  const flavors = (flavorsRaw as Array<{
    id: number
    slug: string
    description: string | null
    is_pinned: boolean
    created_datetime_utc: string
    step_count: number
    caption_count: number
  }> | null) || []

  const totalSteps = flavors.reduce((a, f) => a + Number(f.step_count || 0), 0)
  const totalCaptions = flavors.reduce((a, f) => a + Number(f.caption_count || 0), 0)
  const pinnedCount = flavors.filter((f) => f.is_pinned).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Humor Flavors</h1>
              <p className="text-neutral-600">Browse, search, and inspect humor flavors and their activity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flavors</p>
            <p className="text-3xl font-bold text-purple-700 tabular-nums mt-1">{flavors.length.toLocaleString()}</p>
          </div>
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pinned</p>
            <p className="text-3xl font-bold text-amber-600 tabular-nums mt-1">{pinnedCount.toLocaleString()}</p>
          </div>
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Steps</p>
            <p className="text-3xl font-bold text-blue-700 tabular-nums mt-1">{totalSteps.toLocaleString()}</p>
          </div>
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Captions Produced</p>
            <p className="text-3xl font-bold text-emerald-700 tabular-nums mt-1">{totalCaptions.toLocaleString()}</p>
          </div>
        </div>

        <HumorFlavorsView flavors={flavors} />
      </div>
    </div>
  )
}
