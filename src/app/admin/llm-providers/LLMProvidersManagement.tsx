'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface LLMProvider {
  id: number
  created_datetime_utc: string
  name: string
}

interface Props {
  llmProviders: LLMProvider[]
  currentUser: any
}

export default function LLMProvidersManagement({ llmProviders, currentUser }: Props) {
  const [localProviders, setLocalProviders] = useState(llmProviders)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null)
  const [newProvider, setNewProvider] = useState({ name: '' })
  const supabase = createClient()

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProvider.name.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('llm_providers')
        .insert([{ name: newProvider.name.trim() }])
        .select()
        .single()

      if (error) throw error

      setLocalProviders([data, ...localProviders])
      setNewProvider({ name: '' })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating provider:', error)
      alert('Failed to create provider')
    }
    setIsLoading(false)
  }

  const handleUpdateProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProvider || !editingProvider.name.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('llm_providers')
        .update({ name: editingProvider.name.trim() })
        .eq('id', editingProvider.id)

      if (error) throw error

      setLocalProviders(localProviders.map(provider =>
        provider.id === editingProvider.id ? editingProvider : provider
      ))
      setEditingProvider(null)
    } catch (error) {
      console.error('Error updating provider:', error)
      alert('Failed to update provider')
    }
    setIsLoading(false)
  }

  const handleDeleteProvider = async (providerId: number) => {
    if (!confirm('Are you sure you want to delete this LLM provider? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('llm_providers')
        .delete()
        .eq('id', providerId)

      if (error) throw error

      setLocalProviders(localProviders.filter(provider => provider.id !== providerId))
    } catch (error) {
      console.error('Error deleting provider:', error)
      alert('Failed to delete provider')
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
                <h1 className="text-2xl font-bold text-neutral-900">LLM Providers Management</h1>
                <p className="text-neutral-600">Manage AI language model providers</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              + Add Provider
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New LLM Provider</h2>
              <form onSubmit={handleCreateProvider}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Provider Name</label>
                  <input
                    type="text"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({ name: e.target.value })}
                    className="input-modern"
                    placeholder="e.g., OpenAI, Anthropic, Google"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Creating...' : 'Create Provider'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewProvider({ name: '' })
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
        {editingProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit LLM Provider</h2>
              <form onSubmit={handleUpdateProvider}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Provider Name</label>
                  <input
                    type="text"
                    value={editingProvider.name}
                    onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                    className="input-modern"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update Provider'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProvider(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Providers List */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">LLM Providers ({localProviders.length})</h2>
          </div>

          {localProviders.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🤖</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">No LLM providers yet</h3>
              <p className="text-neutral-600">Add your first AI language model provider to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Provider Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localProviders.map((provider) => (
                    <tr key={provider.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">{provider.name}</div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {new Date(provider.created_datetime_utc).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingProvider(provider)}
                            className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProvider(provider.id)}
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