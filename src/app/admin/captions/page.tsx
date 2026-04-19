import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CaptionsManagement from './CaptionsManagement'

export default async function CaptionsPage() {
  const supabase = await createClient()

  // Check authentication and superadmin status
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
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

  const { count: totalCaptions } = await supabase
    .from('captions')
    .select('*', { count: 'exact', head: true })

  const { data: captions, error } = await supabase
    .from('captions')
    .select(`
      *,
      profiles(email),
      images(url, image_description),
      humor_flavors(slug, description),
      votes:caption_votes(vote_value)
    `)
    .order('created_datetime_utc', { ascending: false })
    .limit(500)

  if (error) {
    console.error('Error fetching captions:', error)
  }

  return (
    <CaptionsManagement
      captions={captions || []}
      totalCount={totalCaptions ?? (captions?.length || 0)}
      currentUser={user}
    />
  )
}