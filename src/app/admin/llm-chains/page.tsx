import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LLMChainsManagement from './LLMChainsManagement'

export default async function LLMChainsPage() {
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

  const { count: totalChains } = await supabase
    .from('llm_prompt_chains')
    .select('*', { count: 'exact', head: true })

  const { data: llmChains, error: chainsError } = await supabase
    .from('llm_prompt_chains')
    .select(`
      *,
      caption_requests (
        id,
        image_id,
        profile_id,
        created_datetime_utc,
        profiles (
          email
        )
      )
    `)
    .order('created_datetime_utc', { ascending: false })
    .limit(500)

  if (chainsError) {
    console.error('Error fetching LLM chains:', chainsError)
  }

  const { data: captionRequests } = await supabase
    .from('caption_requests')
    .select(`
      id,
      profile_id,
      image_id,
      created_datetime_utc,
      profiles (
        email
      )
    `)
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <LLMChainsManagement
      llmChains={llmChains || []}
      totalChains={totalChains ?? (llmChains?.length || 0)}
      captionRequests={captionRequests || []}
      currentUser={user}
    />
  )
}
