import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import HumorStepsManagement from './HumorStepsManagement'

export default async function HumorStepsPage() {
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

  const { data: humorSteps } = await supabase
    .from('humor_flavor_steps')
    .select(`
      *,
      humor_flavors (*),
      llm_models (*),
      llm_input_types (*),
      llm_output_types (*),
      humor_flavor_step_types (*)
    `)
    .order('order_by', { ascending: true })

  const [{ data: humorFlavors }, { data: llmModels }, { data: llmInputTypes }, { data: llmOutputTypes }, { data: humorFlavorStepTypes }] = await Promise.all([
    supabase.from('humor_flavors').select('id, slug').order('slug', { ascending: true }),
    supabase.from('llm_models').select('id, name, provider_model_id').order('name', { ascending: true }),
    supabase.from('llm_input_types').select('id, slug, description').order('slug', { ascending: true }),
    supabase.from('llm_output_types').select('id, slug, description').order('slug', { ascending: true }),
    supabase.from('humor_flavor_step_types').select('id, slug, description').order('slug', { ascending: true }),
  ])

  return (
    <HumorStepsManagement
      humorSteps={humorSteps || []}
      humorFlavors={humorFlavors || []}
      llmModels={llmModels || []}
      llmInputTypes={llmInputTypes || []}
      llmOutputTypes={llmOutputTypes || []}
      humorFlavorStepTypes={humorFlavorStepTypes || []}
      currentUser={user}
    />
  )
}
