'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface Profile {
  id: string
  created_datetime_utc: string
  modified_datetime_utc?: string
  first_name?: string
  last_name?: string
  email?: string
  is_superadmin: boolean
  is_matrix_admin: boolean
  is_in_study: boolean
  images?: { count: number }[]
  captions?: { count: number }[]
  votes?: { count: number }[]
}

interface Props {
  profiles: Profile[]
  currentUser: any
}

export default function UsersManagement({ profiles, currentUser }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'superadmin' | 'study' | 'regular'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [localProfiles, setLocalProfiles] = useState(profiles)
  const supabase = createClient()

  const filteredProfiles = localProfiles.filter(profile => {
    const matchesSearch = profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.id.includes(searchTerm)

    const matchesFilter = filterRole === 'all' ||
                         (filterRole === 'superadmin' && profile.is_superadmin) ||
                         (filterRole === 'study' && profile.is_in_study) ||
                         (filterRole === 'regular' && !profile.is_superadmin && !profile.is_matrix_admin && !profile.is_in_study)

    return matchesSearch && matchesFilter
  })

  const handleToggleRole = async (profileId: string, role: 'superadmin' | 'study', currentStatus: boolean) => {
    if (role === 'superadmin' && profileId === currentUser.id) {
      alert("You cannot modify your own superadmin status!")
      return
    }

    setIsLoading(true)
    try {
      const updateData = role === 'superadmin'
        ? { is_superadmin: !currentStatus }
        : { is_in_study: !currentStatus }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          modified_datetime_utc: new Date().toISOString()
        })
        .eq('id', profileId)

      if (error) throw error

      setLocalProfiles(prev =>
        prev.map(profile =>
          profile.id === profileId
            ? { ...profile, ...updateData }
            : profile
        )
      )
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update user role')
    } finally {
      setIsLoading(false)
    }
  }

  const totalUsers = localProfiles.length
  const superAdmins = localProfiles.filter(p => p.is_superadmin).length
  const studyParticipants = localProfiles.filter(p => p.is_in_study).length
  const activeUsers = localProfiles.filter(p =>
    new Date(p.created_datetime_utc) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Users Management</h1>
              <p className="text-neutral-600">View and manage user accounts and permissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-modern p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <div className="text-blue-600 text-sm font-medium">Total Users</div>
                <div className="text-blue-900 text-2xl font-bold">{totalUsers}</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔧</span>
              </div>
              <div>
                <div className="text-purple-600 text-sm font-medium">Super Admins</div>
                <div className="text-purple-900 text-2xl font-bold">{superAdmins}</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔬</span>
              </div>
              <div>
                <div className="text-green-600 text-sm font-medium">Study Participants</div>
                <div className="text-green-900 text-2xl font-bold">{studyParticipants}</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <div className="text-orange-600 text-sm font-medium">New (30d)</div>
                <div className="text-orange-900 text-2xl font-bold">{activeUsers}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card-modern p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="input-modern w-auto"
            >
              <option value="all">All Users</option>
              <option value="superadmin">Super Admins</option>
              <option value="study">Study Participants</option>
              <option value="regular">Regular Users</option>
            </select>
            <div className="text-sm text-neutral-600">
              {filteredProfiles.length} of {totalUsers} users
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Users ({filteredProfiles.length})</h2>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">👥</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">
                {localProfiles.length === 0 ? 'No users found' : 'No users match your search'}
              </h3>
              <p className="text-neutral-600">
                {localProfiles.length === 0
                  ? 'Users will appear here as they register.'
                  : 'Try adjusting your search criteria or filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Roles</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Activity</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Joined</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {(profile.first_name || profile.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">
                              {profile.first_name && profile.last_name
                                ? `${profile.first_name} ${profile.last_name}`
                                : profile.first_name || 'Unknown User'}
                              {profile.id === currentUser.id && (
                                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-neutral-600">{profile.email}</div>
                            <div className="text-xs text-neutral-500 font-mono">{profile.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 flex-wrap">
                          {profile.is_superadmin && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              Super Admin
                            </span>
                          )}
                          {profile.is_matrix_admin && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Matrix Admin
                            </span>
                          )}
                          {profile.is_in_study && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Study Participant
                            </span>
                          )}
                          {!profile.is_superadmin && !profile.is_matrix_admin && !profile.is_in_study && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              Standard User
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-neutral-700">
                          <div>{profile.images?.[0]?.count || 0} images</div>
                          <div>{profile.captions?.[0]?.count || 0} captions</div>
                          <div>{profile.votes?.[0]?.count || 0} votes</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        <div className="text-sm">
                          {new Date(profile.created_datetime_utc).toLocaleDateString()}
                        </div>
                        {profile.modified_datetime_utc && (
                          <div className="text-xs text-neutral-500">
                            Modified: {new Date(profile.modified_datetime_utc).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {profile.id !== currentUser.id && (
                            <>
                              <button
                                onClick={() => handleToggleRole(profile.id, 'superadmin', profile.is_superadmin)}
                                disabled={isLoading}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  profile.is_superadmin
                                    ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                    : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                                }`}
                              >
                                {profile.is_superadmin ? 'Revoke Admin' : 'Make Admin'}
                              </button>
                              <button
                                onClick={() => handleToggleRole(profile.id, 'study', profile.is_in_study)}
                                disabled={isLoading}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  profile.is_in_study
                                    ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                    : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                }`}
                              >
                                {profile.is_in_study ? 'Remove Study' : 'Add Study'}
                              </button>
                            </>
                          )}
                          {profile.id === currentUser.id && (
                            <span className="text-xs text-neutral-500 px-3 py-1">
                              Current User
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="card-modern p-6 mt-6 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-medium text-amber-900">Security Notice</h3>
              <div className="text-amber-800 text-sm mt-1">
                <p>• Super Admin privileges grant full access to this admin panel</p>
                <p>• You cannot modify your own admin permissions</p>
                <p>• Study participants are included in humor research data</p>
                <p>• All changes are applied immediately and logged</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}