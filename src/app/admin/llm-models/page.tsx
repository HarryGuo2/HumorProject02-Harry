import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LLMModelsManagement from './LLMModelsManagement'

export default async function LLMModelsPage() {
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

  // Fetch LLM models with providers
  const { data: llmModels } = await supabase
    .from('llm_models')
    .select(`
      *,
      llm_providers (
        id,
        name
      )
    `)
    .order('created_datetime_utc', { ascending: false })

  // Fetch LLM providers for dropdown
  const { data: llmProviders } = await supabase
    .from('llm_providers')
    .select('*')
    .order('name', { ascending: true })

  return (
    <LLMModelsManagement
      llmModels={llmModels || []}
      llmProviders={llmProviders || []}
      currentUser={user}
    />
  )
}