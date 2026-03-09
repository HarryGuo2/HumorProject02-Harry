import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CaptionExamplesManagement from './CaptionExamplesManagement'

export default async function CaptionExamplesPage() {
  const supabase = await createClient()

  // Check authentication and authorization
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

  // Fetch caption examples with image info
  const { data: captionExamples } = await supabase
    .from('caption_examples')
    .select(`
      *,
      images (
        id,
        url,
        image_description
      )
    `)
    .order('priority', { ascending: false })
    .order('created_datetime_utc', { ascending: false })

  // Fetch all images for the dropdown
  const { data: images } = await supabase
    .from('images')
    .select('id, url, image_description')
    .order('created_datetime_utc', { ascending: false })

  return (
    <CaptionExamplesManagement
      captionExamples={captionExamples || []}
      images={images || []}
      currentUser={user}
    />
  )
}