'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface LLMProvider {
  id: number
  name: string
}

interface LLMModel {
  id: number
  created_datetime_utc: string
  name: string
  llm_provider_id: number
  provider_model_id: string
  is_temperature_supported: boolean
  llm_providers: LLMProvider
}

interface Props {
  llmModels: LLMModel[]
  llmProviders: LLMProvider[]
  currentUser: any
}

export default function LLMModelsManagement({ llmModels, llmProviders, currentUser }: Props) {
  const [localModels, setLocalModels] = useState(llmModels)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null)
  const [newModel, setNewModel] = useState({
    name: '',
    llm_provider_id: '',
    provider_model_id: '',
    is_temperature_supported: false
  })
  const supabase = createClient()

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newModel.name.trim() || !newModel.llm_provider_id || !newModel.provider_model_id.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('llm_models')
        .insert([{
          name: newModel.name.trim(),
          llm_provider_id: parseInt(newModel.llm_provider_id),
          provider_model_id: newModel.provider_model_id.trim(),
          is_temperature_supported: newModel.is_temperature_supported
        }])
        .select(`
          *,
          llm_providers (
            id,
            name
          )
        `)
        .single()

      if (error) throw error

      setLocalModels([data, ...localModels])
      setNewModel({ name: '', llm_provider_id: '', provider_model_id: '', is_temperature_supported: false })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating model:', error)
      alert('Failed to create model')
    }
    setIsLoading(false)
  }

  const handleUpdateModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingModel || !editingModel.name.trim() || !editingModel.provider_model_id.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('llm_models')
        .update({
          name: editingModel.name.trim(),
          llm_provider_id: editingModel.llm_provider_id,
          provider_model_id: editingModel.provider_model_id.trim(),
          is_temperature_supported: editingModel.is_temperature_supported
        })
        .eq('id', editingModel.id)

      if (error) throw error

      setLocalModels(localModels.map(model =>
        model.id === editingModel.id ? editingModel : model
      ))
      setEditingModel(null)
    } catch (error) {
      console.error('Error updating model:', error)
      alert('Failed to update model')
    }
    setIsLoading(false)
  }

  const handleDeleteModel = async (modelId: number) => {
    if (!confirm('Are you sure you want to delete this LLM model? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('llm_models')
        .delete()
        .eq('id', modelId)

      if (error) throw error

      setLocalModels(localModels.filter(model => model.id !== modelId))
    } catch (error) {
      console.error('Error deleting model:', error)
      alert('Failed to delete model')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-primary-600 hover:text-primary-700">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">LLM Models Management</h1>
                <p className="text-neutral-600">Manage AI language model configurations</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
              disabled={llmProviders.length === 0}
            >
              + Add Model
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New LLM Model</h2>
              <form onSubmit={handleCreateModel}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Model Name</label>
                  <input
                    type="text"
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    className="input-modern"
                    placeholder="e.g., GPT-4, Claude-3-Opus"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Provider</label>
                  <select
                    value={newModel.llm_provider_id}
                    onChange={(e) => setNewModel({ ...newModel, llm_provider_id: e.target.value })}
                    className="input-modern"
                    required
                  >
                    <option value="">Select a provider</option>
                    {llmProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Provider Model ID</label>
                  <input
                    type="text"
                    value={newModel.provider_model_id}
                    onChange={(e) => setNewModel({ ...newModel, provider_model_id: e.target.value })}
                    className="input-modern"
                    placeholder="e.g., gpt-4, claude-3-opus-20240229"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newModel.is_temperature_supported}
                      onChange={(e) => setNewModel({ ...newModel, is_temperature_supported: e.target.checked })}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">Supports temperature parameter</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Creating...' : 'Create Model'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewModel({ name: '', llm_provider_id: '', provider_model_id: '', is_temperature_supported: false })
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit LLM Model</h2>
              <form onSubmit={handleUpdateModel}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Model Name</label>
                  <input
                    type="text"
                    value={editingModel.name}
                    onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                    className="input-modern"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Provider</label>
                  <select
                    value={editingModel.llm_provider_id}
                    onChange={(e) => setEditingModel({ ...editingModel, llm_provider_id: parseInt(e.target.value) })}
                    className="input-modern"
                    required
                  >
                    {llmProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Provider Model ID</label>
                  <input
                    type="text"
                    value={editingModel.provider_model_id}
                    onChange={(e) => setEditingModel({ ...editingModel, provider_model_id: e.target.value })}
                    className="input-modern"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingModel.is_temperature_supported}
                      onChange={(e) => setEditingModel({ ...editingModel, is_temperature_supported: e.target.checked })}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">Supports temperature parameter</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update Model'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingModel(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* No providers warning */}
        {llmProviders.length === 0 && (
          <div className="card-modern p-6 mb-6 border-amber-200 bg-amber-50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-medium text-amber-900">No LLM Providers</h3>
                <p className="text-amber-700 text-sm">
                  You need to create at least one LLM provider before adding models.{' '}
                  <Link href="/admin/llm-providers" className="underline hover:no-underline">
                    Add providers first →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Models List */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">LLM Models ({localModels.length})</h2>
          </div>

          {localModels.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🤖</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">No LLM models yet</h3>
              <p className="text-neutral-600">Add your first AI language model configuration to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Model Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Provider</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Model ID</th>
                    <th className="text-center py-3 px-4 font-semibold text-neutral-900">Temperature</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localModels.map((model) => (
                    <tr key={model.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">{model.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                          {model.llm_providers.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-mono text-sm">
                        {model.provider_model_id}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {model.is_temperature_supported ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-neutral-400">✗</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {new Date(model.created_datetime_utc).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingModel(model)}
                            className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteModel(model.id)}
                            className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            disabled={isLoading}
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