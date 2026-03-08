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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Navigation Header */}
      <nav className="glass-card border-0 rounded-none backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
                  <span className="text-xl animate-float">🎭</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>

              <nav className="ml-8 flex space-x-1">
                <Link href="/admin" className="nav-link nav-link-active font-semibold">
                  Dashboard
                </Link>

                {/* Content Management */}
                <div className="relative group">
                  <button className="nav-link flex items-center gap-1">
                    Content
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 min-w-48 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <Link href="/admin/users" className="block px-4 py-2 text-sm hover:bg-primary-50 rounded-t-lg">👥 Users</Link>
                    <Link href="/admin/images" className="block px-4 py-2 text-sm hover:bg-primary-50">🖼️ Images</Link>
                    <Link href="/admin/captions" className="block px-4 py-2 text-sm hover:bg-primary-50">💬 Captions</Link>
                    <Link href="/admin/caption-requests" className="block px-4 py-2 text-sm hover:bg-primary-50">📝 Caption Requests</Link>
                    <Link href="/admin/caption-examples" className="block px-4 py-2 text-sm hover:bg-primary-50 rounded-b-lg">💡 Caption Examples</Link>
                  </div>
                </div>

                {/* Humor System */}
                <div className="relative group">
                  <button className="nav-link flex items-center gap-1">
                    Humor
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 min-w-48 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <Link href="/admin/humor-flavors" className="block px-4 py-2 text-sm hover:bg-primary-50 rounded-t-lg">🎭 Humor Flavors</Link>
                    <Link href="/admin/humor-steps" className="block px-4 py-2 text-sm hover:bg-primary-50">⚡ Flavor Steps</Link>
                    <Link href="/admin/humor-mix" className="block px-4 py-2 text-sm hover:bg-primary-50 rounded-b-lg">🔀 Humor Mix</Link>
                  </div>
                </div>

                {/* AI/LLM Management */}
                <div className="relative group">
                  <button className="nav-link flex items-center gap-1">
                    AI/LLM
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 min-w-48 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <Link href="/admin/llm-providers" className="block px-4 py-2 text-sm hover:bg-primary-50 rounded-t-lg">🏢 LLM Providers</Link>
                    <Link href="/admin/llm-models" className="block px-4 py-2 text-sm hover:bg-primary-50">🤖 LLM Models</Link>
                    <Link href="/admin/llm-chains" className="block px-4 py-2 text-sm hover:bg-primary-50">🔗 Prompt Chains</Link>
                    <Link href="/admin/llm-responses" className="block px-4 py-2 text-sm hover:bg-primary-50 rounded-b-lg">💬 LLM Responses</Link>
                  </div>
                </div>

                {/* Settings */}
                <div className="relative group">
                  <button className="nav-link flex items-center gap-1">
                    Settings
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 min-w-48 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <Link href="/admin/terms" className="block px-4 py-2 text-sm hover:bg-primary-50 rounded-t-lg">📚 Terms</Link>
                    <Link href="/admin/signup-domains" className="block px-4 py-2 text-sm hover:bg-primary-50">🌐 Signup Domains</Link>
                    <Link href="/admin/whitelist-emails" className="block px-4 py-2 text-sm hover:bg-primary-50 rounded-b-lg">✉️ Whitelist Emails</Link>
                  </div>
                </div>
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                {userAvatar && (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-10 h-10 rounded-full ring-2 ring-primary-200 shadow-soft"
                  />
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-neutral-700">{userName}</p>
                  <p className="text-xs text-neutral-500">Administrator</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-soft hover:shadow-md transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoggingOut ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Logging out...
                  </div>
                ) : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <div className="glass-card rounded-2xl p-8 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-700 to-accent-700 bg-clip-text text-transparent mb-3">
              Welcome to the Dashboard
            </h2>
            <p className="text-neutral-600 text-lg leading-relaxed">
              Manage users, images, and captions for the Humor Project. You have <span className="font-semibold text-primary-700">superadmin access</span>.
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="card-modern p-6 animate-slide-up group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-blue-200 transition-all duration-300">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="card-modern p-6 animate-slide-up group" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-2">Total Images</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalImages.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-green-200 transition-all duration-300">
                <span className="text-2xl">🖼️</span>
              </div>
            </div>
          </div>

          <div className="card-modern p-6 animate-slide-up group" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-2">Total Captions</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalCaptions.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-purple-200 transition-all duration-300">
                <span className="text-2xl">💬</span>
              </div>
            </div>
          </div>

          <div className="card-modern p-6 animate-slide-up group" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-2">Total Votes</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalVotes.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-orange-200 transition-all duration-300">
                <span className="text-2xl">🗳️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Recent Activity */}
          <div className="card-modern p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">📝</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Recent Captions</h3>
            </div>

            <div className="space-y-4">
              {stats.recentCaptions.slice(0, 5).map((caption: any, index: number) => (
                <div key={caption.id} className="p-4 bg-gradient-to-r from-blue-50 to-primary-50 rounded-xl border border-blue-100 hover:shadow-soft transition-all duration-200" style={{ animationDelay: `${index * 0.1}s` }}>
                  <p className="text-sm text-neutral-800 mb-3 font-medium leading-relaxed">
                    "{caption.content?.substring(0, 80)}{caption.content?.length > 80 ? '...' : ''}"
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600">By: <span className="font-medium text-primary-700">{caption.profiles?.email || 'Unknown'}</span></span>
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                        {caption.like_count || 0} likes
                      </span>
                      <span className="text-neutral-500">
                        {new Date(caption.created_datetime_utc).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Captions */}
          <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Top Captions</h3>
            </div>

            <div className="space-y-4">
              {stats.topCaptions.slice(0, 5).map((caption: any, index: number) => (
                <div key={caption.id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 hover:shadow-soft transition-all duration-200 group" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-soft">
                      <span className="text-white text-sm font-bold">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-800 mb-3 font-medium leading-relaxed">
                        "{caption.content?.substring(0, 80)}{caption.content?.length > 80 ? '...' : ''}"
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg font-bold">
                          {caption.like_count || 0} likes
                        </span>
                        <span className="text-neutral-600">
                          By: <span className="font-medium text-orange-700">{caption.profiles?.email || 'Unknown'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-modern p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/users"
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 hover:from-blue-100 hover:to-blue-150"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-blue-200 transition-all duration-300">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1">Manage Users</h4>
                  <p className="text-sm text-neutral-600">View and edit user profiles</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/images"
              className="group p-6 bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 hover:from-green-100 hover:to-emerald-150"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-green-200 transition-all duration-300">
                  <span className="text-2xl">🖼️</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1">Manage Images</h4>
                  <p className="text-sm text-neutral-600">CRUD operations on images</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/captions"
              className="group p-6 bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 hover:from-purple-100 hover:to-violet-150"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-purple-200 transition-all duration-300">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1">View Captions</h4>
                  <p className="text-sm text-neutral-600">Browse and moderate captions</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}