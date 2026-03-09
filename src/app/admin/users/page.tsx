import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UsersManagement from './UsersManagement'

export default async function UsersPage() {
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

  // Fetch all users/profiles with additional data
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      images:images(count),
      captions:captions(count),
      votes:caption_votes(count)
    `)
    .order('created_datetime_utc', { ascending: false })

  if (error) {
    console.error('Error fetching profiles:', error)
  }

  // Get user metadata from auth.users (this requires service role key in production)
  // For now we'll work with what we have from profiles

  return (
    <UsersManagement
      profiles={profiles || []}
      currentUser={user}
    />
  )
}