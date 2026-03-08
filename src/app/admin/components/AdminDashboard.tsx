'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email?: string
  user_metadata: {
    name?: string
    avatar_url?: string
    full_name?: string
  }
}

interface Profile {
  id: string
  is_superadmin: boolean
}

interface Stats {
  totalUsers: number
  totalImages: number
  totalCaptions: number
  totalVotes: number
  recentImages: any[]
  recentCaptions: any[]
  topCaptions: any[]
}

interface Props {
  user: User
  profile: Profile
  stats: Stats
}

export default function AdminDashboard({ user, profile, stats }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email || 'Admin'
  const userAvatar = user.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">🎭 Admin Panel</h1>
              <nav className="ml-8 flex space-x-8">
                <Link href="/admin" className="text-blue-600 border-b-2 border-blue-600 px-1 pb-1">
                  Dashboard
                </Link>
                <Link href="/admin/users" className="text-gray-500 hover:text-gray-700 px-1 pb-1">
                  Users
                </Link>
                <Link href="/admin/images" className="text-gray-500 hover:text-gray-700 px-1 pb-1">
                  Images
                </Link>
                <Link href="/admin/captions" className="text-gray-500 hover:text-gray-700 px-1 pb-1">
                  Captions
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {userAvatar && (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-700">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the Admin Dashboard</h2>
          <p className="text-gray-600">
            Manage users, images, and captions for the Humor Project. You have superadmin access.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">🖼️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Images</dt>
                    <dd className="text-3xl font-bold text-gray-900">{stats.totalImages.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">💬</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Captions</dt>
                    <dd className="text-3xl font-bold text-gray-900">{stats.totalCaptions.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">🗳️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Votes</dt>
                    <dd className="text-3xl font-bold text-gray-900">{stats.totalVotes.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Captions</h3>
              <div className="space-y-3">
                {stats.recentCaptions.slice(0, 5).map((caption: any) => (
                  <div key={caption.id} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-sm text-gray-800 mb-1">
                      "{caption.content?.substring(0, 80)}{caption.content?.length > 80 ? '...' : ''}"
                    </p>
                    <p className="text-xs text-gray-500">
                      By: {caption.profiles?.email || 'Unknown'} • {caption.like_count || 0} likes
                      • {new Date(caption.created_datetime_utc).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Captions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Captions (by likes)</h3>
              <div className="space-y-3">
                {stats.topCaptions.slice(0, 5).map((caption: any, index: number) => (
                  <div key={caption.id} className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full mr-2 mt-1">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 mb-1">
                          "{caption.content?.substring(0, 80)}{caption.content?.length > 80 ? '...' : ''}"
                        </p>
                        <p className="text-xs text-gray-500">
                          {caption.like_count || 0} likes • By: {caption.profiles?.email || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/users"
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Manage Users</h4>
                    <p className="text-sm text-gray-600">View and edit user profiles</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/images"
                className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🖼️</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Manage Images</h4>
                    <p className="text-sm text-gray-600">CRUD operations on images</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/captions"
                className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💬</span>
                  <div>
                    <h4 className="font-medium text-gray-900">View Captions</h4>
                    <p className="text-sm text-gray-600">Browse and moderate captions</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}