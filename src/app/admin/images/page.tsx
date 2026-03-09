import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ImagesManagement from './ImagesManagement'

export default async function ImagesPage() {
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

  // Fetch all images with caption counts
  const { data: images, error } = await supabase
    .from('images')
    .select(`
      *,
      captions:captions(count),
      profiles(email)
    `)
    .order('created_datetime_utc', { ascending: false })

  if (error) {
    console.error('Error fetching images:', error)
  }

  return (
    <ImagesManagement
      images={images || []}
      currentUser={user}
    />
  )
}