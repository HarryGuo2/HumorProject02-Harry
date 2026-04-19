'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface LLMModel {
  id: number
  name: string
  provider_model_id: string
}

interface Profile {
  id: string
  email: string | null
}

interface HumorFlavor {
  id: number
  slug: string
}

interface CaptionRequest {
  id: number
  profile_id: string
  image_id: string
}

interface LLMChain {
  id: number
  caption_request_id: number
}

interface HumorStep {
  id: number
  order_by: number
  humor_flavor_id: number
}

interface LLMResponse {
  id: string
  created_datetime_utc: string
  llm_model_response: string | null
  processing_time_seconds: number
  llm_model_id: number
  profile_id: string
  caption_request_id: number
  llm_system_prompt: string
  llm_user_prompt: string
  llm_temperature: number | null
  humor_flavor_id: number
  llm_prompt_chain_id: number | null
  humor_flavor_step_id: number | null
  llm_models: LLMModel | null
  profiles: { id: string; email: string | null } | null
  humor_flavors: HumorFlavor | null
  llm_prompt_chains: { id: number } | null
  humor_flavor_steps: { id: number; order_by: number; description: string | null } | null
}

interface Props {
  llmResponses: LLMResponse[]
  totalResponses?: number
  llmModels: LLMModel[]
  profiles: Profile[]
  humorFlavors: HumorFlavor[]
  captionRequests: CaptionRequest[]
  llmChains: LLMChain[]
  humorSteps: HumorStep[]
  currentUser: unknown
}

type FormState = {
  llm_model_id: string
  profile_id: string
  caption_request_id: string
  humor_flavor_id: string
  processing_time_seconds: number
  llm_temperature: string
  llm_prompt_chain_id: string
  humor_flavor_step_id: string
  llm_system_prompt: string
  llm_user_prompt: string
  llm_model_response: string
}

const emptyForm: FormState = {
  llm_model_id: '',
  profile_id: '',
  caption_request_id: '',
  humor_flavor_id: '',
  processing_time_seconds: 1,
  llm_temperature: '',
  llm_prompt_chain_id: '',
  humor_flavor_step_id: '',
  llm_system_prompt: '',
  llm_user_prompt: '',
  llm_model_response: '',
}

export default function LLMResponsesManagement({
  llmResponses,
  totalResponses,
  llmModels,
  profiles,
  humorFlavors,
  captionRequests,
  llmChains,
  humorSteps,
  currentUser,
}: Props) {
  const [localResponses, setLocalResponses] = useState(llmResponses)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModelFilter, setSelectedModelFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingResponse, setEditingResponse] = useState<LLMResponse | null>(null)
  const [newResponse, setNewResponse] = useState<FormState>(emptyForm)
  const supabase = createClient()

  void currentUser

  const filteredResponses = localResponses.filter((response) => {
    const modelPass =
      selectedModelFilter === 'all' || response.llm_model_id === parseInt(selectedModelFilter, 10)
    if (!modelPass) return false

    const haystack = `${response.id} ${response.llm_models?.name || ''} ${
      response.profiles?.email || response.profile_id
    } ${response.llm_model_response || ''}`.toLowerCase()
    return haystack.includes(searchTerm.toLowerCase())
  })

  const byNewest = (a: LLMResponse, b: LLMResponse) =>
    new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()

  const parseNullableNumber = (value: string) => {
    if (!value.trim()) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  const runSelectWithRelations = () => `
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
    `

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !newResponse.llm_model_id ||
      !newResponse.profile_id ||
      !newResponse.caption_request_id ||
      !newResponse.humor_flavor_id ||
      !newResponse.llm_system_prompt.trim() ||
      !newResponse.llm_user_prompt.trim()
    ) {
      alert('Please complete all required fields')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('llm_model_responses')
        .insert([
          {
            llm_model_id: parseInt(newResponse.llm_model_id, 10),
            profile_id: newResponse.profile_id,
            caption_request_id: parseInt(newResponse.caption_request_id, 10),
            humor_flavor_id: parseInt(newResponse.humor_flavor_id, 10),
            processing_time_seconds: newResponse.processing_time_seconds,
            llm_temperature: parseNullableNumber(newResponse.llm_temperature),
            llm_prompt_chain_id: newResponse.llm_prompt_chain_id
              ? parseInt(newResponse.llm_prompt_chain_id, 10)
              : null,
            humor_flavor_step_id: newResponse.humor_flavor_step_id
              ? parseInt(newResponse.humor_flavor_step_id, 10)
              : null,
            llm_system_prompt: newResponse.llm_system_prompt.trim(),
            llm_user_prompt: newResponse.llm_user_prompt.trim(),
            llm_model_response: newResponse.llm_model_response.trim() || null,
          },
        ])
        .select(runSelectWithRelations())
        .single()

      if (error) throw error
      const createdRow = data as unknown as LLMResponse
      setLocalResponses([...localResponses, createdRow].sort(byNewest))
      setNewResponse(emptyForm)
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating response:', error)
      alert('Failed to create LLM response row')
    }
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingResponse) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('llm_model_responses')
        .update({
          llm_model_id: editingResponse.llm_model_id,
          profile_id: editingResponse.profile_id,
          caption_request_id: editingResponse.caption_request_id,
          humor_flavor_id: editingResponse.humor_flavor_id,
          processing_time_seconds: editingResponse.processing_time_seconds,
          llm_temperature: editingResponse.llm_temperature,
          llm_prompt_chain_id: editingResponse.llm_prompt_chain_id,
          humor_flavor_step_id: editingResponse.humor_flavor_step_id,
          llm_system_prompt: editingResponse.llm_system_prompt.trim(),
          llm_user_prompt: editingResponse.llm_user_prompt.trim(),
          llm_model_response: editingResponse.llm_model_response?.trim() || null,
        })
        .eq('id', editingResponse.id)
        .select(runSelectWithRelations())
        .single()

      if (error) throw error
      const updatedRow = data as unknown as LLMResponse
      setLocalResponses(localResponses.map((row) => (row.id === updatedRow.id ? updatedRow : row)).sort(byNewest))
      setEditingResponse(null)
    } catch (error) {
      console.error('Error updating response:', error)
      alert('Failed to update LLM response row')
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this LLM response row?')) return
    setIsLoading(true)
    try {
      const { error } = await supabase.from('llm_model_responses').delete().eq('id', id)
      if (error) throw error
      setLocalResponses(localResponses.filter((row) => row.id !== id))
    } catch (error) {
      console.error('Error deleting response:', error)
      alert('Failed to delete LLM response row')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-primary-600 hover:text-primary-700">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">LLM Responses</h1>
                <p className="text-neutral-600">Manage model output rows with full metadata</p>
              </div>
            </div>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary">
              + Add Response Row
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by id, model, user, content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern md:col-span-2"
            />
            <select
              value={selectedModelFilter}
              onChange={(e) => setSelectedModelFilter(e.target.value)}
              className="input-modern"
            >
              <option value="all">All models</option>
              {llmModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-neutral-600 mt-3">
            {filteredResponses.length} of {localResponses.length.toLocaleString()} loaded
            {typeof totalResponses === 'number' && totalResponses > localResponses.length && (
              <> · {totalResponses.toLocaleString()} total in DB</>
            )}
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add LLM Response</h2>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={newResponse.llm_model_id}
                    onChange={(e) => setNewResponse({ ...newResponse, llm_model_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select model</option>
                    {llmModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider_model_id})
                      </option>
                    ))}
                  </select>
                  <select
                    value={newResponse.profile_id}
                    onChange={(e) => setNewResponse({ ...newResponse, profile_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select user profile</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.email || profile.id}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newResponse.caption_request_id}
                    onChange={(e) => setNewResponse({ ...newResponse, caption_request_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select caption request</option>
                    {captionRequests.map((item) => (
                      <option key={item.id} value={item.id}>
                        #{item.id} ({item.profile_id})
                      </option>
                    ))}
                  </select>
                  <select
                    value={newResponse.humor_flavor_id}
                    onChange={(e) => setNewResponse({ ...newResponse, humor_flavor_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select humor flavor</option>
                    {humorFlavors.map((flavor) => (
                      <option key={flavor.id} value={flavor.id}>
                        {flavor.slug}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={newResponse.processing_time_seconds}
                    onChange={(e) =>
                      setNewResponse({
                        ...newResponse,
                        processing_time_seconds: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="input-modern"
                    placeholder="Processing time in seconds"
                    required
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={newResponse.llm_temperature}
                    onChange={(e) => setNewResponse({ ...newResponse, llm_temperature: e.target.value })}
                    className="input-modern"
                    placeholder="Temperature (optional)"
                  />
                  <select
                    value={newResponse.llm_prompt_chain_id}
                    onChange={(e) => setNewResponse({ ...newResponse, llm_prompt_chain_id: e.target.value })}
                    className="input-modern"
                  >
                    <option value="">No prompt chain</option>
                    {llmChains.map((chain) => (
                      <option key={chain.id} value={chain.id}>
                        Chain #{chain.id} (request #{chain.caption_request_id})
                      </option>
                    ))}
                  </select>
                  <select
                    value={newResponse.humor_flavor_step_id}
                    onChange={(e) => setNewResponse({ ...newResponse, humor_flavor_step_id: e.target.value })}
                    className="input-modern"
                  >
                    <option value="">No flavor step</option>
                    {humorSteps.map((step) => (
                      <option key={step.id} value={step.id}>
                        Step #{step.id} (order {step.order_by})
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={newResponse.llm_system_prompt}
                    onChange={(e) => setNewResponse({ ...newResponse, llm_system_prompt: e.target.value })}
                    className="input-modern min-h-28 md:col-span-2"
                    placeholder="System prompt *"
                    required
                  />
                  <textarea
                    value={newResponse.llm_user_prompt}
                    onChange={(e) => setNewResponse({ ...newResponse, llm_user_prompt: e.target.value })}
                    className="input-modern min-h-28 md:col-span-2"
                    placeholder="User prompt *"
                    required
                  />
                  <textarea
                    value={newResponse.llm_model_response}
                    onChange={(e) => setNewResponse({ ...newResponse, llm_model_response: e.target.value })}
                    className="input-modern min-h-28 md:col-span-2"
                    placeholder="Model response (optional)"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewResponse(emptyForm)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit LLM Response</h2>
              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={editingResponse.llm_model_id}
                    onChange={(e) =>
                      setEditingResponse({ ...editingResponse, llm_model_id: parseInt(e.target.value, 10) })
                    }
                    className="input-modern"
                    required
                  >
                    {llmModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider_model_id})
                      </option>
                    ))}
                  </select>
                  <select
                    value={editingResponse.profile_id}
                    onChange={(e) => setEditingResponse({ ...editingResponse, profile_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.email || profile.id}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editingResponse.caption_request_id}
                    onChange={(e) =>
                      setEditingResponse({
                        ...editingResponse,
                        caption_request_id: parseInt(e.target.value, 10),
                      })
                    }
                    className="input-modern"
                    required
                  >
                    {captionRequests.map((item) => (
                      <option key={item.id} value={item.id}>
                        #{item.id} ({item.profile_id})
                      </option>
                    ))}
                  </select>
                  <select
                    value={editingResponse.humor_flavor_id}
                    onChange={(e) =>
                      setEditingResponse({
                        ...editingResponse,
                        humor_flavor_id: parseInt(e.target.value, 10),
                      })
                    }
                    className="input-modern"
                    required
                  >
                    {humorFlavors.map((flavor) => (
                      <option key={flavor.id} value={flavor.id}>
                        {flavor.slug}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={editingResponse.processing_time_seconds}
                    onChange={(e) =>
                      setEditingResponse({
                        ...editingResponse,
                        processing_time_seconds: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="input-modern"
                    required
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={editingResponse.llm_temperature ?? ''}
                    onChange={(e) =>
                      setEditingResponse({
                        ...editingResponse,
                        llm_temperature: parseNullableNumber(e.target.value),
                      })
                    }
                    className="input-modern"
                    placeholder="Temperature (optional)"
                  />
                  <select
                    value={editingResponse.llm_prompt_chain_id || ''}
                    onChange={(e) =>
                      setEditingResponse({
                        ...editingResponse,
                        llm_prompt_chain_id: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="input-modern"
                  >
                    <option value="">No prompt chain</option>
                    {llmChains.map((chain) => (
                      <option key={chain.id} value={chain.id}>
                        Chain #{chain.id} (request #{chain.caption_request_id})
                      </option>
                    ))}
                  </select>
                  <select
                    value={editingResponse.humor_flavor_step_id || ''}
                    onChange={(e) =>
                      setEditingResponse({
                        ...editingResponse,
                        humor_flavor_step_id: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="input-modern"
                  >
                    <option value="">No flavor step</option>
                    {humorSteps.map((step) => (
                      <option key={step.id} value={step.id}>
                        Step #{step.id} (order {step.order_by})
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={editingResponse.llm_system_prompt}
                    onChange={(e) =>
                      setEditingResponse({ ...editingResponse, llm_system_prompt: e.target.value })
                    }
                    className="input-modern min-h-28 md:col-span-2"
                    required
                  />
                  <textarea
                    value={editingResponse.llm_user_prompt}
                    onChange={(e) =>
                      setEditingResponse({ ...editingResponse, llm_user_prompt: e.target.value })
                    }
                    className="input-modern min-h-28 md:col-span-2"
                    required
                  />
                  <textarea
                    value={editingResponse.llm_model_response || ''}
                    onChange={(e) =>
                      setEditingResponse({ ...editingResponse, llm_model_response: e.target.value })
                    }
                    className="input-modern min-h-28 md:col-span-2"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => setEditingResponse(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card-modern p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Model Responses ({filteredResponses.length})</h2>
          {filteredResponses.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">No responses found.</div>
          ) : (
            <div className="space-y-4">
              {filteredResponses.map((response) => (
                <div key={response.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                      {response.llm_models?.name || `Model #${response.llm_model_id}`}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {response.humor_flavors?.slug || `Flavor #${response.humor_flavor_id}`}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {response.processing_time_seconds}s
                    </span>
                  </div>
                  <div className="text-sm text-neutral-700 mb-3">
                    User: {response.profiles?.email || response.profile_id} • Request: {response.caption_request_id} •
                    Created: {new Date(response.created_datetime_utc).toLocaleString()}
                  </div>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap line-clamp-3 mb-3">
                    {response.llm_model_response || 'No response content'}
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingResponse(response)}
                      className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(response.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
