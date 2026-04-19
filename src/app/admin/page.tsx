import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminDashboard from './components/AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin, id')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) {
    redirect('/unauthorized')
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const [
    usersResult,
    imagesResult,
    captionsResult,
    votesResult,
    usersThisWeek,
    usersLastWeek,
    imagesThisWeek,
    imagesLastWeek,
    captionsThisWeek,
    captionsLastWeek,
    votesThisWeek,
    votesLastWeek,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', sevenDaysAgo),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', fourteenDaysAgo).lt('created_datetime_utc', sevenDaysAgo),
    supabase.from('images').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', sevenDaysAgo),
    supabase.from('images').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', fourteenDaysAgo).lt('created_datetime_utc', sevenDaysAgo),
    supabase.from('captions').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', sevenDaysAgo),
    supabase.from('captions').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', fourteenDaysAgo).lt('created_datetime_utc', sevenDaysAgo),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', sevenDaysAgo),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', fourteenDaysAgo).lt('created_datetime_utc', sevenDaysAgo),
  ])

  const { data: recentImages, error: recentImagesError } = await supabase
    .from('images')
    .select('*')
    .order('created_datetime_utc', { ascending: false })
    .limit(5)

  if (recentImagesError) {
    console.error('Error fetching recent images:', recentImagesError)
  }

  const { data: recentCaptions, error: recentCaptionsError } = await supabase
    .from('captions')
    .select('*, profiles:profiles!captions_profile_id_fkey (email)')
    .order('created_datetime_utc', { ascending: false })
    .limit(5)

  if (recentCaptionsError) {
    console.error('Error fetching recent captions:', recentCaptionsError)
  }

  const { data: topCaptions, error: topCaptionsError } = await supabase
    .from('captions')
    .select('*, profiles:profiles!captions_profile_id_fkey (email)')
    .order('like_count', { ascending: false })
    .limit(5)

  if (topCaptionsError) {
    console.error('Error fetching top captions:', topCaptionsError)
  }

  const [captionsPerDayRes, usersPerDayRes, topFlavorsRes, topModelsRes] = await Promise.all([
    supabase.rpc('admin_captions_per_day', { days_back: 14 }),
    supabase.rpc('admin_users_per_day', { days_back: 30 }),
    supabase.rpc('admin_top_flavors', { lim: 8 }),
    supabase.rpc('admin_top_models', { lim: 8 }),
  ])

  if (captionsPerDayRes.error) console.error('captionsPerDay error:', captionsPerDayRes.error)
  if (usersPerDayRes.error) console.error('usersPerDay error:', usersPerDayRes.error)
  if (topFlavorsRes.error) console.error('topFlavors error:', topFlavorsRes.error)
  if (topModelsRes.error) console.error('topModels error:', topModelsRes.error)

  const stats = {
    totalUsers: usersResult.count || 0,
    totalImages: imagesResult.count || 0,
    totalCaptions: captionsResult.count || 0,
    totalVotes: votesResult.count || 0,
    weekly: {
      users: { thisWeek: usersThisWeek.count || 0, lastWeek: usersLastWeek.count || 0 },
      images: { thisWeek: imagesThisWeek.count || 0, lastWeek: imagesLastWeek.count || 0 },
      captions: { thisWeek: captionsThisWeek.count || 0, lastWeek: captionsLastWeek.count || 0 },
      votes: { thisWeek: votesThisWeek.count || 0, lastWeek: votesLastWeek.count || 0 },
    },
    charts: {
      captionsPerDay: (captionsPerDayRes.data as Array<{ day: string; c: number }> | null) || [],
      usersPerDay: (usersPerDayRes.data as Array<{ day: string; c: number }> | null) || [],
      topFlavors: (topFlavorsRes.data as Array<{ id: number; slug: string; caption_count: number }> | null) || [],
      topModels: (topModelsRes.data as Array<{ id: number; name: string; provider: string; uses: number }> | null) || [],
    },
    recentImages: recentImages || [],
    recentCaptions: recentCaptions || [],
    topCaptions: topCaptions || [],
  }

  return (
    <AdminDashboard
      user={user}
      profile={profile}
      stats={stats}
    />
  )
}
