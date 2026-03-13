'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface HumorFlavor {
  id: number
  slug: string
}

interface LLMModel {
  id: number
  name: string
  provider_model_id: string
}

interface LLMInputType {
  id: number
  slug: string
  description: string
}

interface LLMOutputType {
  id: number
  slug: string
  description: string
}

interface HumorFlavorStepType {
  id: number
  slug: string
  description: string
}

interface HumorStep {
  id: number
  created_datetime_utc: string
  humor_flavor_id: number
  llm_temperature: number | null
  order_by: number
  llm_input_type_id: number
  llm_output_type_id: number
  llm_model_id: number
  humor_flavor_step_type_id: number
  llm_system_prompt: string | null
  llm_user_prompt: string | null
  description: string | null
  humor_flavors: HumorFlavor | null
  llm_models: LLMModel | null
  llm_input_types: LLMInputType | null
  llm_output_types: LLMOutputType | null
  humor_flavor_step_types: HumorFlavorStepType | null
}

interface Props {
  humorSteps: HumorStep[]
  humorFlavors: HumorFlavor[]
  llmModels: LLMModel[]
  llmInputTypes: LLMInputType[]
  llmOutputTypes: LLMOutputType[]
  humorFlavorStepTypes: HumorFlavorStepType[]
  currentUser: unknown
}

type StepFormState = {
  humor_flavor_id: string
  order_by: number
  llm_model_id: string
  llm_input_type_id: string
  llm_output_type_id: string
  humor_flavor_step_type_id: string
  llm_temperature: string
  description: string
  llm_system_prompt: string
  llm_user_prompt: string
}

const emptyStepForm: StepFormState = {
  humor_flavor_id: '',
  order_by: 1,
  llm_model_id: '',
  llm_input_type_id: '',
  llm_output_type_id: '',
  humor_flavor_step_type_id: '',
  llm_temperature: '',
  description: '',
  llm_system_prompt: '',
  llm_user_prompt: '',
}

export default function HumorStepsManagement({
  humorSteps,
  humorFlavors,
  llmModels,
  llmInputTypes,
  llmOutputTypes,
  humorFlavorStepTypes,
  currentUser,
}: Props) {
  const [localSteps, setLocalSteps] = useState(humorSteps)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStep, setEditingStep] = useState<HumorStep | null>(null)
  const [newStep, setNewStep] = useState<StepFormState>(emptyStepForm)
  const supabase = createClient()

  void currentUser

  const filteredSteps = localSteps.filter((step) => {
    const text = `${step.humor_flavors?.slug || ''} ${step.humor_flavor_step_types?.slug || ''} ${
      step.description || ''
    } ${step.llm_models?.name || ''}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase()) || String(step.id).includes(searchTerm)
  })

  const byOrderThenCreated = (a: HumorStep, b: HumorStep) => {
    if (a.order_by !== b.order_by) return a.order_by - b.order_by
    return new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()
  }

  const parseTemperature = (value: string) => {
    if (!value.trim()) return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !newStep.humor_flavor_id ||
      !newStep.llm_model_id ||
      !newStep.llm_input_type_id ||
      !newStep.llm_output_type_id ||
      !newStep.humor_flavor_step_type_id
    ) {
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('humor_flavor_steps')
        .insert([
          {
            humor_flavor_id: parseInt(newStep.humor_flavor_id, 10),
            order_by: newStep.order_by,
            llm_model_id: parseInt(newStep.llm_model_id, 10),
            llm_input_type_id: parseInt(newStep.llm_input_type_id, 10),
            llm_output_type_id: parseInt(newStep.llm_output_type_id, 10),
            humor_flavor_step_type_id: parseInt(newStep.humor_flavor_step_type_id, 10),
            llm_temperature: parseTemperature(newStep.llm_temperature),
            description: newStep.description.trim() || null,
            llm_system_prompt: newStep.llm_system_prompt.trim() || null,
            llm_user_prompt: newStep.llm_user_prompt.trim() || null,
          },
        ])
        .select(
          `
          *,
          humor_flavors (*),
          llm_models (*),
          llm_input_types (*),
          llm_output_types (*),
          humor_flavor_step_types (*)
        `
        )
        .single()

      if (error) throw error
      setLocalSteps([...localSteps, data].sort(byOrderThenCreated))
      setNewStep(emptyStepForm)
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating humor step:', error)
      alert('Failed to create humor step')
    }
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStep) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('humor_flavor_steps')
        .update({
          humor_flavor_id: editingStep.humor_flavor_id,
          order_by: editingStep.order_by,
          llm_model_id: editingStep.llm_model_id,
          llm_input_type_id: editingStep.llm_input_type_id,
          llm_output_type_id: editingStep.llm_output_type_id,
          humor_flavor_step_type_id: editingStep.humor_flavor_step_type_id,
          llm_temperature: editingStep.llm_temperature,
          description: editingStep.description?.trim() || null,
          llm_system_prompt: editingStep.llm_system_prompt?.trim() || null,
          llm_user_prompt: editingStep.llm_user_prompt?.trim() || null,
        })
        .eq('id', editingStep.id)
        .select(
          `
          *,
          humor_flavors (*),
          llm_models (*),
          llm_input_types (*),
          llm_output_types (*),
          humor_flavor_step_types (*)
        `
        )
        .single()

      if (error) throw error
      setLocalSteps(localSteps.map((step) => (step.id === data.id ? data : step)).sort(byOrderThenCreated))
      setEditingStep(null)
    } catch (error) {
      console.error('Error updating humor step:', error)
      alert('Failed to update humor step')
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this humor flavor step?')) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from('humor_flavor_steps').delete().eq('id', id)
      if (error) throw error
      setLocalSteps(localSteps.filter((step) => step.id !== id))
    } catch (error) {
      console.error('Error deleting humor step:', error)
      alert('Failed to delete humor step')
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
                <h1 className="text-2xl font-bold text-neutral-900">Humor Flavor Steps</h1>
                <p className="text-neutral-600">Manage the generation pipeline steps for each humor flavor</p>
              </div>
            </div>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary">
              + Add Step
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern p-6 mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by flavor, step type, model, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern flex-1"
            />
            <div className="text-sm text-neutral-600">
              {filteredSteps.length} of {localSteps.length} steps
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add Humor Step</h2>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={newStep.humor_flavor_id}
                    onChange={(e) => setNewStep({ ...newStep, humor_flavor_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select humor flavor</option>
                    {humorFlavors.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.slug}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    className="input-modern"
                    value={newStep.order_by}
                    onChange={(e) => setNewStep({ ...newStep, order_by: parseInt(e.target.value, 10) || 1 })}
                    placeholder="Order"
                    required
                  />
                  <select
                    value={newStep.humor_flavor_step_type_id}
                    onChange={(e) => setNewStep({ ...newStep, humor_flavor_step_type_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select step type</option>
                    {humorFlavorStepTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.slug}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newStep.llm_model_id}
                    onChange={(e) => setNewStep({ ...newStep, llm_model_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select model</option>
                    {llmModels.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.provider_model_id})
                      </option>
                    ))}
                  </select>
                  <select
                    value={newStep.llm_input_type_id}
                    onChange={(e) => setNewStep({ ...newStep, llm_input_type_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select input type</option>
                    {llmInputTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.slug}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newStep.llm_output_type_id}
                    onChange={(e) => setNewStep({ ...newStep, llm_output_type_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select output type</option>
                    {llmOutputTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.slug}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    className="input-modern md:col-span-2"
                    value={newStep.llm_temperature}
                    onChange={(e) => setNewStep({ ...newStep, llm_temperature: e.target.value })}
                    placeholder="Temperature (optional)"
                  />
                  <input
                    type="text"
                    className="input-modern md:col-span-2"
                    value={newStep.description}
                    onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                    placeholder="Description (optional)"
                  />
                  <textarea
                    className="input-modern min-h-28 md:col-span-2"
                    value={newStep.llm_system_prompt}
                    onChange={(e) => setNewStep({ ...newStep, llm_system_prompt: e.target.value })}
                    placeholder="System prompt (optional)"
                  />
                  <textarea
                    className="input-modern min-h-28 md:col-span-2"
                    value={newStep.llm_user_prompt}
                    onChange={(e) => setNewStep({ ...newStep, llm_user_prompt: e.target.value })}
                    placeholder="User prompt template (optional)"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Creating...' : 'Create Step'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewStep(emptyStepForm)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingStep && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Humor Step</h2>
              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={editingStep.humor_flavor_id}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, humor_flavor_id: parseInt(e.target.value, 10) })
                    }
                    className="input-modern"
                    required
                  >
                    {humorFlavors.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.slug}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    className="input-modern"
                    value={editingStep.order_by}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, order_by: parseInt(e.target.value, 10) || 1 })
                    }
                    required
                  />
                  <select
                    value={editingStep.humor_flavor_step_type_id}
                    onChange={(e) =>
                      setEditingStep({
                        ...editingStep,
                        humor_flavor_step_type_id: parseInt(e.target.value, 10),
                      })
                    }
                    className="input-modern"
                    required
                  >
                    {humorFlavorStepTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.slug}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editingStep.llm_model_id}
                    onChange={(e) => setEditingStep({ ...editingStep, llm_model_id: parseInt(e.target.value, 10) })}
                    className="input-modern"
                    required
                  >
                    {llmModels.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.provider_model_id})
                      </option>
                    ))}
                  </select>
                  <select
                    value={editingStep.llm_input_type_id}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, llm_input_type_id: parseInt(e.target.value, 10) })
                    }
                    className="input-modern"
                    required
                  >
                    {llmInputTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.slug}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editingStep.llm_output_type_id}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, llm_output_type_id: parseInt(e.target.value, 10) })
                    }
                    className="input-modern"
                    required
                  >
                    {llmOutputTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.slug}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    className="input-modern md:col-span-2"
                    value={editingStep.llm_temperature ?? ''}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, llm_temperature: parseTemperature(e.target.value) })
                    }
                    placeholder="Temperature (optional)"
                  />
                  <input
                    type="text"
                    className="input-modern md:col-span-2"
                    value={editingStep.description || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                    placeholder="Description (optional)"
                  />
                  <textarea
                    className="input-modern min-h-28 md:col-span-2"
                    value={editingStep.llm_system_prompt || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, llm_system_prompt: e.target.value })}
                    placeholder="System prompt (optional)"
                  />
                  <textarea
                    className="input-modern min-h-28 md:col-span-2"
                    value={editingStep.llm_user_prompt || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, llm_user_prompt: e.target.value })}
                    placeholder="User prompt template (optional)"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update Step'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => setEditingStep(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card-modern p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Flavor Steps ({filteredSteps.length})</h2>
          {filteredSteps.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">No steps found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Order</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Flavor</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Step Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Model</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Input → Output</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Temp</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSteps.map((step) => (
                    <tr key={step.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">{step.order_by}</td>
                      <td className="py-3 px-4">{step.humor_flavors?.slug || `#${step.humor_flavor_id}`}</td>
                      <td className="py-3 px-4">
                        {step.humor_flavor_step_types?.slug || `#${step.humor_flavor_step_type_id}`}
                      </td>
                      <td className="py-3 px-4">
                        {step.llm_models?.name || `#${step.llm_model_id}`}
                      </td>
                      <td className="py-3 px-4">
                        {(step.llm_input_types?.slug || `#${step.llm_input_type_id}`) +
                          ' → ' +
                          (step.llm_output_types?.slug || `#${step.llm_output_type_id}`)}
                      </td>
                      <td className="py-3 px-4">{step.llm_temperature ?? 'Default'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingStep(step)}
                            className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(step.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
