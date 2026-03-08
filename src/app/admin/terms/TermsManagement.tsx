'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface TermType {
  id: number
  name: string
}

interface Term {
  id: number
  created_datetime_utc: string
  modified_datetime_utc: string | null
  term: string
  definition: string
  example: string
  priority: number
  term_type_id: number | null
  term_types: TermType | null
}

interface Props {
  terms: Term[]
  termTypes: TermType[]
  currentUser: any
}

export default function TermsManagement({ terms, termTypes, currentUser }: Props) {
  const [localTerms, setLocalTerms] = useState(terms)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newTerm, setNewTerm] = useState({
    term: '',
    definition: '',
    example: '',
    priority: 0,
    term_type_id: ''
  })
  const supabase = createClient()

  const filteredTerms = localTerms.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTerm.term.trim() || !newTerm.definition.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('terms')
        .insert([{
          term: newTerm.term.trim(),
          definition: newTerm.definition.trim(),
          example: newTerm.example.trim(),
          priority: newTerm.priority,
          term_type_id: newTerm.term_type_id ? parseInt(newTerm.term_type_id) : null
        }])
        .select(`
          *,
          term_types (
            id,
            name
          )
        `)
        .single()

      if (error) throw error

      setLocalTerms([data, ...localTerms])
      setNewTerm({ term: '', definition: '', example: '', priority: 0, term_type_id: '' })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating term:', error)
      alert('Failed to create term')
    }
    setIsLoading(false)
  }

  const handleUpdateTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTerm || !editingTerm.term.trim() || !editingTerm.definition.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('terms')
        .update({
          term: editingTerm.term.trim(),
          definition: editingTerm.definition.trim(),
          example: editingTerm.example.trim(),
          priority: editingTerm.priority,
          term_type_id: editingTerm.term_type_id,
          modified_datetime_utc: new Date().toISOString()
        })
        .eq('id', editingTerm.id)

      if (error) throw error

      setLocalTerms(localTerms.map(term =>
        term.id === editingTerm.id ? editingTerm : term
      ))
      setEditingTerm(null)
    } catch (error) {
      console.error('Error updating term:', error)
      alert('Failed to update term')
    }
    setIsLoading(false)
  }

  const handleDeleteTerm = async (termId: number) => {
    if (!confirm('Are you sure you want to delete this term? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('terms')
        .delete()
        .eq('id', termId)

      if (error) throw error

      setLocalTerms(localTerms.filter(term => term.id !== termId))
    } catch (error) {
      console.error('Error deleting term:', error)
      alert('Failed to delete term')
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
                <h1 className="text-2xl font-bold text-neutral-900">Terms Management</h1>
                <p className="text-neutral-600">Manage dictionary terms and definitions</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              + Add Term
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="card-modern p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search terms or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern"
              />
            </div>
            <div className="text-sm text-neutral-600">
              {filteredTerms.length} of {localTerms.length} terms
            </div>
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Term</h2>
              <form onSubmit={handleCreateTerm}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Term *</label>
                    <input
                      type="text"
                      value={newTerm.term}
                      onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                      className="input-modern"
                      placeholder="e.g., Meme"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={newTerm.term_type_id}
                      onChange={(e) => setNewTerm({ ...newTerm, term_type_id: e.target.value })}
                      className="input-modern"
                    >
                      <option value="">No category</option>
                      {termTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Definition *</label>
                  <textarea
                    value={newTerm.definition}
                    onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
                    className="input-modern min-h-20"
                    placeholder="Provide a clear definition..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Example</label>
                  <textarea
                    value={newTerm.example}
                    onChange={(e) => setNewTerm({ ...newTerm, example: e.target.value })}
                    className="input-modern min-h-20"
                    placeholder="Provide an example or usage..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Priority (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newTerm.priority}
                    onChange={(e) => setNewTerm({ ...newTerm, priority: parseInt(e.target.value) || 0 })}
                    className="input-modern"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Creating...' : 'Create Term'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewTerm({ term: '', definition: '', example: '', priority: 0, term_type_id: '' })
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
        {editingTerm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Term</h2>
              <form onSubmit={handleUpdateTerm}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Term *</label>
                    <input
                      type="text"
                      value={editingTerm.term}
                      onChange={(e) => setEditingTerm({ ...editingTerm, term: e.target.value })}
                      className="input-modern"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={editingTerm.term_type_id || ''}
                      onChange={(e) => setEditingTerm({ ...editingTerm, term_type_id: e.target.value ? parseInt(e.target.value) : null })}
                      className="input-modern"
                    >
                      <option value="">No category</option>
                      {termTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Definition *</label>
                  <textarea
                    value={editingTerm.definition}
                    onChange={(e) => setEditingTerm({ ...editingTerm, definition: e.target.value })}
                    className="input-modern min-h-20"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Example</label>
                  <textarea
                    value={editingTerm.example}
                    onChange={(e) => setEditingTerm({ ...editingTerm, example: e.target.value })}
                    className="input-modern min-h-20"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Priority (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editingTerm.priority}
                    onChange={(e) => setEditingTerm({ ...editingTerm, priority: parseInt(e.target.value) || 0 })}
                    className="input-modern"
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update Term'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTerm(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Terms List */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Terms ({filteredTerms.length})</h2>
          </div>

          {filteredTerms.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📖</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">
                {localTerms.length === 0 ? 'No terms yet' : 'No terms match your search'}
              </h3>
              <p className="text-neutral-600">
                {localTerms.length === 0 ? 'Add your first term to get started.' : 'Try adjusting your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTerms.map((term) => (
                <div key={term.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">{term.term}</h3>
                        {term.term_types && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                            {term.term_types.name}
                          </span>
                        )}
                        {term.priority > 0 && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium">
                            Priority: {term.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-700 mb-2">{term.definition}</p>
                      {term.example && (
                        <div className="bg-neutral-100 border-l-4 border-primary-300 p-3 rounded">
                          <p className="text-sm text-neutral-600 italic">{term.example}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                        <span>Created: {new Date(term.created_datetime_utc).toLocaleDateString()}</span>
                        {term.modified_datetime_utc && (
                          <span>Modified: {new Date(term.modified_datetime_utc).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditingTerm(term)}
                        className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTerm(term.id)}
                        className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
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