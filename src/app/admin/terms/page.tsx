import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TermsManagement from './TermsManagement'

export default async function TermsPage() {
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

  // Fetch terms with term types
  const { data: terms } = await supabase
    .from('terms')
    .select(`
      *,
      term_types (
        id,
        name
      )
    `)
    .order('priority', { ascending: false })
    .order('created_datetime_utc', { ascending: false })

  // Fetch term types for dropdown
  const { data: termTypes } = await supabase
    .from('term_types')
    .select('*')
    .order('name', { ascending: true })

  return (
    <TermsManagement
      terms={terms || []}
      termTypes={termTypes || []}
      currentUser={user}
    />
  )
}