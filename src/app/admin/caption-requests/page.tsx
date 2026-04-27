import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CaptionRequestsView from './CaptionRequestsView'

export default async function CaptionRequestsPage() {
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

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [totalRes, todayRes, weekRes, withCaptionsRes, requestsRes] = await Promise.all([
    supabase.from('caption_requests').select('*', { count: 'exact', head: true }),
    supabase.from('caption_requests').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', startOfToday),
    supabase.from('caption_requests').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', sevenDaysAgo),
    supabase.from('captions').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', sevenDaysAgo),
    supabase.rpc('admin_caption_requests_recent', { lim: 500 }),
  ])

  if (requestsRes.error) {
    console.error('admin_caption_requests_recent error:', requestsRes.error)
  }

  const requests = (requestsRes.data as Array<{
    id: number
    created_datetime_utc: string
    profile_id: string | null
    profile_email: string | null
    image_id: string | null
    image_url: string | null
    image_description: string | null
    caption_count: number
    response_count: number
    top_humor_flavor_slug: string | null
  }> | null) || []

  const totalRequests = totalRes.count || 0
  const todayRequests = todayRes.count || 0
  const weekRequests = weekRes.count || 0
  const weekCaptions = withCaptionsRes.count || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Caption Requests</h1>
              <p className="text-neutral-600">Each API request to generate captions, with image preview and result stats</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Requests</p>
            <p className="text-3xl font-bold text-orange-600 tabular-nums mt-1">{totalRequests.toLocaleString('en-US')}</p>
          </div>
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today</p>
            <p className="text-3xl font-bold text-blue-700 tabular-nums mt-1">{todayRequests.toLocaleString('en-US')}</p>
          </div>
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last 7 days</p>
            <p className="text-3xl font-bold text-purple-700 tabular-nums mt-1">{weekRequests.toLocaleString('en-US')}</p>
          </div>
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Captions (7d)</p>
            <p className="text-3xl font-bold text-emerald-700 tabular-nums mt-1">{weekCaptions.toLocaleString('en-US')}</p>
          </div>
        </div>

        <CaptionRequestsView
          requests={requests}
          totalRequests={totalRequests}
        />
      </div>
    </div>
  )
}
