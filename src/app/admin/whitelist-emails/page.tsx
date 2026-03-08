import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import WhitelistEmailsManagement from './WhitelistEmailsManagement'

export default async function WhitelistEmailsPage() {
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

  // Fetch whitelisted email addresses
  const { data: whitelistEmails } = await supabase
    .from('whitelist_email_addresses')
    .select('*')
    .order('email_address', { ascending: true })

  return (
    <WhitelistEmailsManagement
      whitelistEmails={whitelistEmails || []}
      currentUser={user}
    />
  )
}