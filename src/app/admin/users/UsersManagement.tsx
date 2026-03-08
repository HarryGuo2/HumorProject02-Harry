'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface Profile {
  id: string
  created_at: string
  is_superadmin: boolean
  email?: string
  captions?: { count: number }[]
  votes?: { count: number }[]
}

interface Props {
  profiles: Profile[]
  currentUser: any
}

export default function UsersManagement({ profiles, currentUser }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [localProfiles, setLocalProfiles] = useState(profiles)
  const supabase = createClient()

  const filteredProfiles = localProfiles.filter(profile =>
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.id.includes(searchTerm)
  )

  const handleSuperadminToggle = async (profileId: string, currentStatus: boolean) => {
    if (profileId === currentUser.id) {
      alert("You cannot modify your own superadmin status!")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_superadmin: !currentStatus })
        .eq('id', profileId)

      if (error) {
        throw error
      }

      // Update local state
      setLocalProfiles(prev =>
        prev.map(profile =>
          profile.id === profileId
            ? { ...profile, is_superadmin: !currentStatus }
            : profile
        )
      )

      alert(`User ${!currentStatus ? 'granted' : 'revoked'} superadmin privileges`)
    } catch (error) {
      console.error('Error updating superadmin status:', error)
      alert('Failed to update superadmin status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">👥 User Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">User Profiles</h2>
          <p className="text-gray-600">
            Manage user accounts and permissions. Total users: {profiles.length}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users by email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredProfiles.length} of {profiles.length} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {profile.email?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {profile.email || 'No email'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {profile.id === currentUser.id && <span className="text-blue-600 font-medium">(You)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {profile.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{(profile.captions as any)?.[0]?.count || 0} captions</div>
                          <div className="text-gray-500">{(profile.votes as any)?.[0]?.count || 0} votes</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          profile.is_superadmin
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {profile.is_superadmin ? 'Superadmin' : 'Regular User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleSuperadminToggle(profile.id, profile.is_superadmin)}
                          disabled={isLoading || profile.id === currentUser.id}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            profile.id === currentUser.id
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : profile.is_superadmin
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          } transition-colors`}
                        >
                          {isLoading ? 'Updating...' :
                           profile.id === currentUser.id ? 'Current User' :
                           profile.is_superadmin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProfiles.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Security Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  • Superadmin privileges grant full access to this admin panel<br/>
                  • You cannot modify your own permissions<br/>
                  • Changes are applied immediately and affect user access to protected resources
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}