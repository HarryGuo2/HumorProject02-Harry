'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface HumorFlavor {
  id: number
  slug: string
  description: string | null
}

interface HumorMixRow {
  id: number
  created_datetime_utc: string
  humor_flavor_id: number
  caption_count: number
  humor_flavors: HumorFlavor | null
}

interface Props {
  humorMix: HumorMixRow[]
  humorFlavors: HumorFlavor[]
  currentUser: unknown
}

export default function HumorMixManagement({ humorMix, humorFlavors, currentUser }: Props) {
  const [localRows, setLocalRows] = useState(humorMix)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRow, setEditingRow] = useState<HumorMixRow | null>(null)
  const [newRow, setNewRow] = useState({
    humor_flavor_id: '',
    caption_count: 1,
  })
  const supabase = createClient()

  void currentUser

  const filteredRows = localRows.filter((row) => {
    const flavorSlug = row.humor_flavors?.slug || ''
    return (
      flavorSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(row.id).includes(searchTerm)
    )
  })

  const byNewest = (a: HumorMixRow, b: HumorMixRow) =>
    new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRow.humor_flavor_id || newRow.caption_count < 1) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('humor_flavor_mix')
        .insert([
          {
            humor_flavor_id: parseInt(newRow.humor_flavor_id, 10),
            caption_count: newRow.caption_count,
          },
        ])
        .select(
          `
          *,
          humor_flavors (
            id,
            slug,
            description
          )
        `
        )
        .single()

      if (error) throw error

      setLocalRows([...localRows, data].sort(byNewest))
      setNewRow({ humor_flavor_id: '', caption_count: 1 })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating humor mix row:', error)
      alert('Failed to create humor mix row')
    }
    setIsLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRow || editingRow.caption_count < 1) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('humor_flavor_mix')
        .update({
          humor_flavor_id: editingRow.humor_flavor_id,
          caption_count: editingRow.caption_count,
        })
        .eq('id', editingRow.id)
        .select(
          `
          *,
          humor_flavors (
            id,
            slug,
            description
          )
        `
        )
        .single()

      if (error) throw error

      setLocalRows(localRows.map((row) => (row.id === data.id ? data : row)).sort(byNewest))
      setEditingRow(null)
    } catch (error) {
      console.error('Error updating humor mix row:', error)
      alert('Failed to update humor mix row')
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this humor mix row?')) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from('humor_flavor_mix').delete().eq('id', id)
      if (error) throw error
      setLocalRows(localRows.filter((row) => row.id !== id))
    } catch (error) {
      console.error('Error deleting humor mix row:', error)
      alert('Failed to delete humor mix row')
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
                <h1 className="text-2xl font-bold text-neutral-900">Humor Flavor Mix</h1>
                <p className="text-neutral-600">Manage flavor-to-caption-count mix rows</p>
              </div>
            </div>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary">
              + Add Mix Row
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern p-6 mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by ID or flavor slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern flex-1"
            />
            <div className="text-sm text-neutral-600">
              {filteredRows.length} of {localRows.length} rows
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Humor Mix Row</h2>
              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Humor Flavor *</label>
                    <select
                      value={newRow.humor_flavor_id}
                      onChange={(e) => setNewRow({ ...newRow, humor_flavor_id: e.target.value })}
                      className="input-modern"
                      required
                    >
                      <option value="">Select a flavor</option>
                      {humorFlavors.map((flavor) => (
                        <option key={flavor.id} value={flavor.id}>
                          {flavor.slug}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Caption Count *</label>
                    <input
                      type="number"
                      min={1}
                      value={newRow.caption_count}
                      onChange={(e) =>
                        setNewRow({ ...newRow, caption_count: parseInt(e.target.value, 10) || 1 })
                      }
                      className="input-modern"
                      required
                    />
                  </div>
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
                      setNewRow({ humor_flavor_id: '', caption_count: 1 })
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingRow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Humor Mix Row</h2>
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Humor Flavor *</label>
                    <select
                      value={editingRow.humor_flavor_id}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Caption Count *</label>
                    <input
                      type="number"
                      min={1}
                      value={editingRow.caption_count}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
                          caption_count: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="input-modern"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => setEditingRow(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card-modern p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Humor Mix Rows ({filteredRows.length})</h2>
          {filteredRows.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">No rows found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Flavor</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Caption Count</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-mono text-sm">{row.id}</td>
                      <td className="py-3 px-4">{row.humor_flavors?.slug || `#${row.humor_flavor_id}`}</td>
                      <td className="py-3 px-4">{row.caption_count}</td>
                      <td className="py-3 px-4 text-neutral-600">
                        {new Date(row.created_datetime_utc).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingRow(row)}
                            className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
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
