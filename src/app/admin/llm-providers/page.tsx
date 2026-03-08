import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LLMProvidersManagement from './LLMProvidersManagement'

export default async function LLMProvidersPage() {
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

  // Fetch LLM providers
  const { data: llmProviders } = await supabase
    .from('llm_providers')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

  return (
    <LLMProvidersManagement
      llmProviders={llmProviders || []}
      currentUser={user}
    />
  )
}