import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SignupDomainsManagement from './SignupDomainsManagement'

export default async function SignupDomainsPage() {
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

  // Fetch allowed signup domains
  const { data: signupDomains } = await supabase
    .from('allowed_signup_domains')
    .select('*')
    .order('apex_domain', { ascending: true })

  return (
    <SignupDomainsManagement
      signupDomains={signupDomains || []}
      currentUser={user}
    />
  )
}