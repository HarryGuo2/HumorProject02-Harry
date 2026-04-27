'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface CaptionRequest {
  id: number
  profile_id: string
  image_id: string
  created_datetime_utc: string
  profiles: { email: string | null }[] | { email: string | null } | null
}

interface LLMChain {
  id: number
  created_datetime_utc: string
  caption_request_id: number
  caption_requests: CaptionRequest[] | CaptionRequest | null
}

interface Props {
  llmChains: LLMChain[]
  totalChains?: number
  captionRequests: CaptionRequest[]
  currentUser: unknown
}

export default function LLMChainsManagement({ llmChains, totalChains, captionRequests, currentUser }: Props) {
  const [localChains, setLocalChains] = useState(llmChains)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingChain, setEditingChain] = useState<LLMChain | null>(null)
  const [newCaptionRequestId, setNewCaptionRequestId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  void currentUser

  const extractEmail = (
    profiles: { email: string | null }[] | { email: string | null } | null | undefined
  ) => {
    if (!profiles) return null
    if (Array.isArray(profiles)) return profiles[0]?.email || null
    return profiles.email || null
  }

  const extractRequest = (req: CaptionRequest[] | CaptionRequest | null | undefined) => {
    if (!req) return null
    if (Array.isArray(req)) return req[0] || null
    return req
  }

  const filteredChains = localChains.filter((chain) => {
    const requestEmail = extractEmail(extractRequest(chain.caption_requests)?.profiles) || ''
    const haystack = `${chain.id} ${chain.caption_request_id} ${requestEmail}`.toLowerCase()
    return haystack.includes(searchTerm.toLowerCase())
  })

  const byNewest = (a: LLMChain, b: LLMChain) =>
    new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCaptionRequestId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('llm_prompt_chains')
        .insert([{ caption_request_id: parseInt(newCaptionRequestId, 10) }])
        .select(
          `
          *,
          caption_requests (
            id,
            profile_id,
            image_id,
            created_datetime_utc,
            profiles:profiles!caption_requests_profile_id_fkey (email)
          )
        `
        )
        .single()

      if (error) throw error
      setLocalChains([...localChains, data].sort(byNewest))
      setNewCaptionRequestId('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating chain:', error)
      alert('Failed to create prompt chain')
    }
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingChain) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('llm_prompt_chains')
        .update({ caption_request_id: editingChain.caption_request_id })
        .eq('id', editingChain.id)
        .select(
          `
          *,
          caption_requests (
            id,
            profile_id,
            image_id,
            created_datetime_utc,
            profiles:profiles!caption_requests_profile_id_fkey (email)
          )
        `
        )
        .single()

      if (error) throw error
      setLocalChains(localChains.map((chain) => (chain.id === data.id ? data : chain)).sort(byNewest))
      setEditingChain(null)
    } catch (error) {
      console.error('Error updating chain:', error)
      alert('Failed to update prompt chain')
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this prompt chain?')) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from('llm_prompt_chains').delete().eq('id', id)
      if (error) throw error
      setLocalChains(localChains.filter((chain) => chain.id !== id))
    } catch (error) {
      console.error('Error deleting chain:', error)
      alert('Failed to delete prompt chain')
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
                <h1 className="text-2xl font-bold text-neutral-900">LLM Prompt Chains</h1>
                <p className="text-neutral-600">Manage chain records attached to caption requests</p>
              </div>
            </div>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary">
              + Add Chain
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern p-6 mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by chain ID, request ID, or user email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern flex-1"
            />
            <div className="text-sm text-neutral-600">
              {filteredChains.length} of {localChains.length.toLocaleString('en-US')} loaded
              {typeof totalChains === 'number' && totalChains > localChains.length && (
                <> · {totalChains.toLocaleString('en-US')} total in DB</>
              )}
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Add Prompt Chain</h2>
              <form onSubmit={handleCreate}>
                <div>
                  <label className="block text-sm font-medium mb-2">Caption Request *</label>
                  <select
                    value={newCaptionRequestId}
                    onChange={(e) => setNewCaptionRequestId(e.target.value)}
                    className="input-modern"
                    required
                  >
                    <option value="">Select request</option>
                    {captionRequests.map((request) => (
                      <option key={request.id} value={request.id}>
                        #{request.id} — {extractEmail(request.profiles) || request.profile_id}
                      </option>
                    ))}
                  </select>
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
                      setNewCaptionRequestId('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingChain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Edit Prompt Chain</h2>
              <form onSubmit={handleUpdate}>
                <div>
                  <label className="block text-sm font-medium mb-2">Caption Request *</label>
                  <select
                    value={editingChain.caption_request_id}
                    onChange={(e) =>
                      setEditingChain({
                        ...editingChain,
                        caption_request_id: parseInt(e.target.value, 10),
                      })
                    }
                    className="input-modern"
                    required
                  >
                    {captionRequests.map((request) => (
                      <option key={request.id} value={request.id}>
                        #{request.id} — {extractEmail(request.profiles) || request.profile_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => setEditingChain(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card-modern p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Prompt Chains ({filteredChains.length})</h2>
          {filteredChains.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">No chains found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Chain ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Caption Request</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Request User</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChains.map((chain) => (
                    <tr key={chain.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-mono text-sm">{chain.id}</td>
                      <td className="py-3 px-4 font-mono text-sm">{chain.caption_request_id}</td>
                      <td className="py-3 px-4 text-neutral-700">
                        {extractEmail(extractRequest(chain.caption_requests)?.profiles) ||
                          extractRequest(chain.caption_requests)?.profile_id ||
                          '-'}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {new Date(chain.created_datetime_utc).toLocaleString('en-US')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingChain(chain)}
                            className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(chain.id)}
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
