'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface SignupDomain {
  id: number
  created_datetime_utc: string
  apex_domain: string
}

interface Props {
  signupDomains: SignupDomain[]
  currentUser: any
}

export default function SignupDomainsManagement({ signupDomains, currentUser }: Props) {
  const [localDomains, setLocalDomains] = useState(signupDomains)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDomain, setEditingDomain] = useState<SignupDomain | null>(null)
  const [newDomain, setNewDomain] = useState({ apex_domain: '' })
  const supabase = createClient()

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain.apex_domain.trim()) return

    // Basic domain validation
    const domain = newDomain.apex_domain.trim().toLowerCase()
    if (!domain.includes('.') || domain.includes(' ')) {
      alert('Please enter a valid domain (e.g., university.edu)')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('allowed_signup_domains')
        .insert([{ apex_domain: domain }])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          alert('This domain is already in the whitelist')
        } else {
          throw error
        }
        return
      }

      setLocalDomains([...localDomains, data].sort((a, b) => a.apex_domain.localeCompare(b.apex_domain)))
      setNewDomain({ apex_domain: '' })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating domain:', error)
      alert('Failed to create domain')
    }
    setIsLoading(false)
  }

  const handleUpdateDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDomain || !editingDomain.apex_domain.trim()) return

    // Basic domain validation
    const domain = editingDomain.apex_domain.trim().toLowerCase()
    if (!domain.includes('.') || domain.includes(' ')) {
      alert('Please enter a valid domain (e.g., university.edu)')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('allowed_signup_domains')
        .update({ apex_domain: domain })
        .eq('id', editingDomain.id)

      if (error) {
        if (error.code === '23505') {
          alert('This domain is already in the whitelist')
        } else {
          throw error
        }
        return
      }

      setLocalDomains(localDomains.map(domainItem =>
        domainItem.id === editingDomain.id ? { ...editingDomain, apex_domain: domain } : domainItem
      ).sort((a, b) => a.apex_domain.localeCompare(b.apex_domain)))
      setEditingDomain(null)
    } catch (error) {
      console.error('Error updating domain:', error)
      alert('Failed to update domain')
    }
    setIsLoading(false)
  }

  const handleDeleteDomain = async (domainId: number) => {
    if (!confirm('Are you sure you want to remove this domain from the signup whitelist? Users with email addresses from this domain will no longer be able to sign up.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('allowed_signup_domains')
        .delete()
        .eq('id', domainId)

      if (error) throw error

      setLocalDomains(localDomains.filter(domain => domain.id !== domainId))
    } catch (error) {
      console.error('Error deleting domain:', error)
      alert('Failed to delete domain')
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
                <h1 className="text-2xl font-bold text-neutral-900">Allowed Signup Domains</h1>
                <p className="text-neutral-600">Manage domains allowed for user signup</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              + Add Domain
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="card-modern p-6 mb-6 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-medium text-blue-900">Domain Whitelist</h3>
              <p className="text-blue-700 text-sm">
                Only users with email addresses from these domains will be allowed to create accounts.
                Add university domains (e.g., university.edu) or organization domains to control access.
              </p>
            </div>
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Allowed Domain</h2>
              <form onSubmit={handleCreateDomain}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Domain</label>
                  <input
                    type="text"
                    value={newDomain.apex_domain}
                    onChange={(e) => setNewDomain({ apex_domain: e.target.value })}
                    className="input-modern"
                    placeholder="e.g., university.edu, company.com"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Enter the apex domain only (e.g., "university.edu" not "mail.university.edu")
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Adding...' : 'Add Domain'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewDomain({ apex_domain: '' })
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
        {editingDomain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Domain</h2>
              <form onSubmit={handleUpdateDomain}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Domain</label>
                  <input
                    type="text"
                    value={editingDomain.apex_domain}
                    onChange={(e) => setEditingDomain({ ...editingDomain, apex_domain: e.target.value })}
                    className="input-modern"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update Domain'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDomain(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Domains List */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🌐</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Allowed Domains ({localDomains.length})</h2>
          </div>

          {localDomains.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🔒</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">No domains whitelisted</h3>
              <p className="text-neutral-600">
                Add university or organization domains to control who can sign up for accounts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Domain</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Added</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localDomains.map((domain) => (
                    <tr key={domain.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-neutral-900">{domain.apex_domain}</span>
                          <span className="text-xs text-neutral-500">
                            *@{domain.apex_domain}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {new Date(domain.created_datetime_utc).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingDomain(domain)}
                            className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDomain(domain.id)}
                            className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            disabled={isLoading}
                          >
                            Remove
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