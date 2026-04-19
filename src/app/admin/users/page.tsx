import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UsersManagement from './UsersManagement'

export default async function UsersPage() {
  const supabase = await createClient()

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

  const { data: rpcRows, error } = await supabase.rpc('admin_profiles_with_stats', { lim: 500 })

  if (error) {
    console.error('admin_profiles_with_stats error:', error)
  }

  const profiles = ((rpcRows as Array<{
    id: string
    created_datetime_utc: string
    modified_datetime_utc: string | null
    first_name: string | null
    last_name: string | null
    email: string | null
    is_superadmin: boolean
    is_matrix_admin: boolean
    is_in_study: boolean
    image_count: number
    caption_count: number
    vote_count: number
  }> | null) || []).map((p) => ({
    id: p.id,
    created_datetime_utc: p.created_datetime_utc,
    modified_datetime_utc: p.modified_datetime_utc || undefined,
    first_name: p.first_name || undefined,
    last_name: p.last_name || undefined,
    email: p.email || undefined,
    is_superadmin: p.is_superadmin,
    is_matrix_admin: p.is_matrix_admin,
    is_in_study: p.is_in_study,
    images: [{ count: Number(p.image_count || 0) }],
    captions: [{ count: Number(p.caption_count || 0) }],
    votes: [{ count: Number(p.vote_count || 0) }],
  }))

  return (
    <UsersManagement
      profiles={profiles}
      currentUser={user}
    />
  )
}
