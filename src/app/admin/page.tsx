import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminDashboard from './components/AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/')
  }

  // Verify superadmin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin, id')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) {
    redirect('/unauthorized')
  }

  // Fetch statistics for dashboard
  const [usersResult, imagesResult, captionsResult, votesResult] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact' }),
    supabase.from('images').select('*', { count: 'exact' }),
    supabase.from('captions').select('*', { count: 'exact' }),
    supabase.from('caption_votes').select('*', { count: 'exact' })
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
    .select('*, profiles(email)')
    .order('created_datetime_utc', { ascending: false })
    .limit(5)

  if (recentCaptionsError) {
    console.error('Error fetching recent captions:', recentCaptionsError)
  }

  const { data: topCaptions, error: topCaptionsError } = await supabase
    .from('captions')
    .select('*, profiles(email)')
    .order('like_count', { ascending: false })
    .limit(5)

  if (topCaptionsError) {
    console.error('Error fetching top captions:', topCaptionsError)
  }

  const stats = {
    totalUsers: usersResult.count || 0,
    totalImages: imagesResult.count || 0,
    totalCaptions: captionsResult.count || 0,
    totalVotes: votesResult.count || 0,
    recentImages: recentImages || [],
    recentCaptions: recentCaptions || [],
    topCaptions: topCaptions || []
  }

  return (
    <AdminDashboard
      user={user}
      profile={profile}
      stats={stats}
    />
  )
}