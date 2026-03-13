import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import HumorMixManagement from './HumorMixManagement'

export default async function HumorMixPage() {
  const supabase = await createClient()

  // Check authentication and authorization
  const {
    data: { user },
  } = await supabase.auth.getUser()
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

  const { data: humorMix } = await supabase
    .from('humor_flavor_mix')
    .select(`
      *,
      humor_flavors (*)
    `)
    .order('created_datetime_utc', { ascending: false })

  const { data: humorFlavors } = await supabase
    .from('humor_flavors')
    .select('*')
    .order('slug', { ascending: true })

  return (
    <HumorMixManagement
      humorMix={humorMix || []}
      humorFlavors={humorFlavors || []}
      currentUser={user}
    />
  )
}
