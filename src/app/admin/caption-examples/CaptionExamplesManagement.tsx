'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface CaptionExample {
  id: number
  created_datetime_utc: string
  modified_datetime_utc: string | null
  image_description: string
  caption: string
  explanation: string
  priority: number
  image_id: string | null
  images?: {
    id: string
    url: string
    image_description: string
  }
}

interface Props {
  captionExamples: CaptionExample[]
  images: Array<{ id: string; url: string; image_description: string }>
  currentUser: any
}

export default function CaptionExamplesManagement({ captionExamples, images, currentUser }: Props) {
  const [localExamples, setLocalExamples] = useState(captionExamples)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingExample, setEditingExample] = useState<CaptionExample | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newExample, setNewExample] = useState({
    image_description: '',
    caption: '',
    explanation: '',
    priority: 0,
    image_id: ''
  })
  const supabase = createClient()

  const filteredExamples = localExamples.filter(example =>
    example.image_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    example.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
    example.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateExample = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExample.image_description.trim() || !newExample.caption.trim() || !newExample.explanation.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('caption_examples')
        .insert([{
          image_description: newExample.image_description.trim(),
          caption: newExample.caption.trim(),
          explanation: newExample.explanation.trim(),
          priority: newExample.priority,
          image_id: newExample.image_id || null
        }])
        .select(`
          *,
          images (
            id,
            url,
            image_description
          )
        `)
        .single()

      if (error) throw error

      setLocalExamples([...localExamples, data].sort((a, b) => b.priority - a.priority || new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()))
      setNewExample({ image_description: '', caption: '', explanation: '', priority: 0, image_id: '' })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating caption example:', error)
      alert('Failed to create caption example')
    }
    setIsLoading(false)
  }

  const handleUpdateExample = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExample || !editingExample.image_description.trim() || !editingExample.caption.trim() || !editingExample.explanation.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('caption_examples')
        .update({
          image_description: editingExample.image_description.trim(),
          caption: editingExample.caption.trim(),
          explanation: editingExample.explanation.trim(),
          priority: editingExample.priority,
          image_id: editingExample.image_id || null,
          modified_datetime_utc: new Date().toISOString()
        })
        .eq('id', editingExample.id)

      if (error) throw error

      setLocalExamples(localExamples.map(example =>
        example.id === editingExample.id ? editingExample : example
      ).sort((a, b) => b.priority - a.priority || new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()))
      setEditingExample(null)
    } catch (error) {
      console.error('Error updating caption example:', error)
      alert('Failed to update caption example')
    }
    setIsLoading(false)
  }

  const handleDeleteExample = async (exampleId: number) => {
    if (!confirm('Are you sure you want to delete this caption example? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('caption_examples')
        .delete()
        .eq('id', exampleId)

      if (error) throw error

      setLocalExamples(localExamples.filter(example => example.id !== exampleId))
    } catch (error) {
      console.error('Error deleting caption example:', error)
      alert('Failed to delete caption example')
    }
    setIsLoading(false)
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800'
    if (priority >= 5) return 'bg-orange-100 text-orange-800'
    if (priority >= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
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
                <h1 className="text-2xl font-bold text-neutral-900">Caption Examples</h1>
                <p className="text-neutral-600">Manage example captions for few-shot learning</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              + Add Example
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="card-modern p-6 mb-6 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-medium text-blue-900">Caption Examples</h3>
              <p className="text-blue-700 text-sm">
                These examples are used for few-shot learning to help AI models generate better captions.
                Higher priority examples are used more frequently in prompts.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card-modern p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search examples by description, caption, or explanation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern"
              />
            </div>
            <div className="text-sm text-neutral-600">
              {filteredExamples.length} of {localExamples.length} examples
            </div>
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add Caption Example</h2>
              <form onSubmit={handleCreateExample}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Image Description *</label>
                    <textarea
                      value={newExample.image_description}
                      onChange={(e) => setNewExample({ ...newExample, image_description: e.target.value })}
                      className="input-modern min-h-20"
                      placeholder="Describe what's in the image..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Caption *</label>
                    <textarea
                      value={newExample.caption}
                      onChange={(e) => setNewExample({ ...newExample, caption: e.target.value })}
                      className="input-modern min-h-20"
                      placeholder="The funny caption for this image..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Explanation *</label>
                    <textarea
                      value={newExample.explanation}
                      onChange={(e) => setNewExample({ ...newExample, explanation: e.target.value })}
                      className="input-modern min-h-20"
                      placeholder="Explain why this caption is funny or effective..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={newExample.priority}
                        onChange={(e) => setNewExample({ ...newExample, priority: parseInt(e.target.value) || 0 })}
                        className="input-modern"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Associated Image</label>
                      <select
                        value={newExample.image_id}
                        onChange={(e) => setNewExample({ ...newExample, image_id: e.target.value })}
                        className="input-modern"
                      >
                        <option value="">None</option>
                        {images.map((image) => (
                          <option key={image.id} value={image.id}>
                            {image.image_description || image.url}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Adding...' : 'Add Example'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewExample({ image_description: '', caption: '', explanation: '', priority: 0, image_id: '' })
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
        {editingExample && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Caption Example</h2>
              <form onSubmit={handleUpdateExample}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Image Description *</label>
                    <textarea
                      value={editingExample.image_description}
                      onChange={(e) => setEditingExample({ ...editingExample, image_description: e.target.value })}
                      className="input-modern min-h-20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Caption *</label>
                    <textarea
                      value={editingExample.caption}
                      onChange={(e) => setEditingExample({ ...editingExample, caption: e.target.value })}
                      className="input-modern min-h-20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Explanation *</label>
                    <textarea
                      value={editingExample.explanation}
                      onChange={(e) => setEditingExample({ ...editingExample, explanation: e.target.value })}
                      className="input-modern min-h-20"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={editingExample.priority}
                        onChange={(e) => setEditingExample({ ...editingExample, priority: parseInt(e.target.value) || 0 })}
                        className="input-modern"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Associated Image</label>
                      <select
                        value={editingExample.image_id || ''}
                        onChange={(e) => setEditingExample({ ...editingExample, image_id: e.target.value || null })}
                        className="input-modern"
                      >
                        <option value="">None</option>
                        {images.map((image) => (
                          <option key={image.id} value={image.id}>
                            {image.image_description || image.url}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update Example'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingExample(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Examples List */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Caption Examples ({filteredExamples.length})</h2>
          </div>

          {filteredExamples.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">💡</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">
                {localExamples.length === 0 ? 'No caption examples yet' : 'No examples match your search'}
              </h3>
              <p className="text-neutral-600">
                {localExamples.length === 0
                  ? 'Add caption examples to help train AI models with few-shot learning.'
                  : 'Try adjusting your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExamples.map((example) => (
                <div key={example.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(example.priority)}`}>
                          Priority {example.priority}
                        </span>
                        {example.images && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <span>🖼️</span>
                            <span>Linked to image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-1">Image Description</h4>
                        <p className="text-neutral-700 text-sm">{example.image_description}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-1">Caption</h4>
                        <p className="text-neutral-700 font-medium">{example.caption}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-1">Explanation</h4>
                        <p className="text-neutral-600 text-sm">{example.explanation}</p>
                      </div>
                      <div className="text-xs text-neutral-500">
                        Created: {new Date(example.created_datetime_utc).toLocaleDateString()}
                        {example.modified_datetime_utc && (
                          <> • Modified: {new Date(example.modified_datetime_utc).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => setEditingExample(example)}
                        className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExample(example.id)}
                        className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors text-sm"
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