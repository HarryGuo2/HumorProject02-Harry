'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface WhitelistEmail {
  id: number
  created_datetime_utc: string
  modified_datetime_utc: string | null
  email_address: string
}

interface Props {
  whitelistEmails: WhitelistEmail[]
  currentUser: any
}

export default function WhitelistEmailsManagement({ whitelistEmails, currentUser }: Props) {
  const [localEmails, setLocalEmails] = useState(whitelistEmails)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEmail, setEditingEmail] = useState<WhitelistEmail | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newEmail, setNewEmail] = useState({ email_address: '' })
  const [bulkEmails, setBulkEmails] = useState('')
  const [showBulkForm, setShowBulkForm] = useState(false)
  const supabase = createClient()

  const filteredEmails = localEmails.filter(email =>
    email.email_address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleCreateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = newEmail.email_address.trim().toLowerCase()
    if (!email || !validateEmail(email)) {
      alert('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('whitelist_email_addresses')
        .insert([{ email_address: email }])
        .select()
        .single()

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          alert('This email address is already whitelisted')
        } else {
          throw error
        }
        return
      }

      setLocalEmails([...localEmails, data].sort((a, b) => a.email_address.localeCompare(b.email_address)))
      setNewEmail({ email_address: '' })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating email:', error)
      alert('Failed to whitelist email address')
    }
    setIsLoading(false)
  }

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const emails = bulkEmails
      .split('\n')
      .map(email => email.trim().toLowerCase())
      .filter(email => email && validateEmail(email))

    if (emails.length === 0) {
      alert('Please enter valid email addresses')
      return
    }

    setIsLoading(true)
    try {
      const insertData = emails.map(email => ({ email_address: email }))
      const { data, error } = await supabase
        .from('whitelist_email_addresses')
        .insert(insertData)
        .select()

      if (error) throw error

      setLocalEmails([...localEmails, ...data].sort((a, b) => a.email_address.localeCompare(b.email_address)))
      setBulkEmails('')
      setShowBulkForm(false)
    } catch (error) {
      console.error('Error bulk creating emails:', error)
      alert('Failed to bulk whitelist emails. Some emails might already exist.')
    }
    setIsLoading(false)
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmail) return

    const email = editingEmail.email_address.trim().toLowerCase()
    if (!email || !validateEmail(email)) {
      alert('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('whitelist_email_addresses')
        .update({
          email_address: email,
          modified_datetime_utc: new Date().toISOString()
        })
        .eq('id', editingEmail.id)

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          alert('This email address is already whitelisted')
        } else {
          throw error
        }
        return
      }

      setLocalEmails(localEmails.map(emailItem =>
        emailItem.id === editingEmail.id ? { ...editingEmail, email_address: email } : emailItem
      ).sort((a, b) => a.email_address.localeCompare(b.email_address)))
      setEditingEmail(null)
    } catch (error) {
      console.error('Error updating email:', error)
      alert('Failed to update email address')
    }
    setIsLoading(false)
  }

  const handleDeleteEmail = async (emailId: number) => {
    if (!confirm('Are you sure you want to remove this email from the whitelist?')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('whitelist_email_addresses')
        .delete()
        .eq('id', emailId)

      if (error) throw error

      setLocalEmails(localEmails.filter(email => email.id !== emailId))
    } catch (error) {
      console.error('Error deleting email:', error)
      alert('Failed to remove email address')
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
                <h1 className="text-2xl font-bold text-neutral-900">Whitelist Email Addresses</h1>
                <p className="text-neutral-600">Manage individual email addresses allowed for signup</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkForm(true)}
                className="btn-secondary"
              >
                📋 Bulk Add
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                + Add Email
              </button>
            </div>
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
                placeholder="Search email addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern"
              />
            </div>
            <div className="text-sm text-neutral-600">
              {filteredEmails.length} of {localEmails.length} emails
            </div>
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Email to Whitelist</h2>
              <form onSubmit={handleCreateEmail}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={newEmail.email_address}
                    onChange={(e) => setNewEmail({ email_address: e.target.value })}
                    className="input-modern"
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Adding...' : 'Add Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewEmail({ email_address: '' })
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

        {/* Bulk Form Modal */}
        {showBulkForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Bulk Add Email Addresses</h2>
              <form onSubmit={handleBulkCreate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Email Addresses (one per line)</label>
                  <textarea
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    className="input-modern min-h-40"
                    placeholder="user1@example.com&#10;user2@university.edu&#10;admin@company.org"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Enter one email address per line. Invalid emails will be skipped.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Adding...' : 'Add All Emails'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkForm(false)
                      setBulkEmails('')
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
        {editingEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Email Address</h2>
              <form onSubmit={handleUpdateEmail}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editingEmail.email_address}
                    onChange={(e) => setEditingEmail({ ...editingEmail, email_address: e.target.value })}
                    className="input-modern"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? 'Updating...' : 'Update Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEmail(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Emails List */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Whitelisted Emails ({filteredEmails.length})</h2>
          </div>

          {filteredEmails.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📧</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">
                {localEmails.length === 0 ? 'No emails whitelisted' : 'No emails match your search'}
              </h3>
              <p className="text-neutral-600">
                {localEmails.length === 0
                  ? 'Add individual email addresses to allow specific users to sign up.'
                  : 'Try adjusting your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Email Address</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Added</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Modified</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map((email) => (
                    <tr key={email.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-neutral-900">{email.email_address}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {new Date(email.created_datetime_utc).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {email.modified_datetime_utc
                          ? new Date(email.modified_datetime_utc).toLocaleDateString('en-US', { timeZone: 'UTC' })
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingEmail(email)}
                            className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEmail(email.id)}
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