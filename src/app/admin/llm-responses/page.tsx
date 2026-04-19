import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LLMResponsesManagement from './LLMResponsesManagement'

export default async function LLMResponsesPage() {
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

  const { count: totalResponses } = await supabase
    .from('llm_model_responses')
    .select('*', { count: 'exact', head: true })

  const { data: llmResponses, error: llmResponsesError } = await supabase
    .from('llm_model_responses')
    .select(`
      *,
      llm_models (
        id,
        name,
        provider_model_id
      ),
      profiles (
        id,
        email
      ),
      humor_flavors (
        id,
        slug
      ),
      llm_prompt_chains (
        id
      ),
      humor_flavor_steps (
        id,
        order_by,
        description
      )
    `)
    .order('created_datetime_utc', { ascending: false })
    .limit(500)

  if (llmResponsesError) {
    console.error('Error fetching LLM model responses:', llmResponsesError)
  }

  const [
    { data: llmModels },
    { data: profiles },
    { data: humorFlavors },
    { data: captionRequests },
    { data: llmChains },
    { data: humorSteps },
  ] = await Promise.all([
    supabase.from('llm_models').select('id, name, provider_model_id').order('name', { ascending: true }),
    supabase.from('profiles').select('id, email').order('created_datetime_utc', { ascending: false }).limit(200),
    supabase.from('humor_flavors').select('id, slug').order('slug', { ascending: true }),
    supabase.from('caption_requests').select('id, profile_id, image_id').order('created_datetime_utc', { ascending: false }).limit(200),
    supabase.from('llm_prompt_chains').select('id, caption_request_id').order('created_datetime_utc', { ascending: false }).limit(200),
    supabase.from('humor_flavor_steps').select('id, order_by, humor_flavor_id').order('order_by', { ascending: true }).limit(500),
  ])

  return (
    <LLMResponsesManagement
      llmResponses={llmResponses || []}
      totalResponses={totalResponses ?? (llmResponses?.length || 0)}
      llmModels={llmModels || []}
      profiles={profiles || []}
      humorFlavors={humorFlavors || []}
      captionRequests={captionRequests || []}
      llmChains={llmChains || []}
      humorSteps={humorSteps || []}
      currentUser={user}
    />
  )
}
