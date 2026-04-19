'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MiniBarChart from './MiniBarChart'

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

interface WeeklyDelta {
  thisWeek: number
  lastWeek: number
}

interface Stats {
  totalUsers: number
  totalImages: number
  totalCaptions: number
  totalVotes: number
  weekly?: {
    users: WeeklyDelta
    images: WeeklyDelta
    captions: WeeklyDelta
    votes: WeeklyDelta
  }
  charts?: {
    captionsPerDay: Array<{ day: string; c: number }>
    usersPerDay: Array<{ day: string; c: number }>
    topFlavors: Array<{ id: number; slug: string; caption_count: number }>
    topModels: Array<{ id: number; name: string; provider: string; uses: number }>
  }
  recentImages: any[]
  recentCaptions: any[]
  topCaptions: any[]
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return <span className="text-xs text-slate-400">no change</span>
  }
  const delta = current - previous
  const pct = previous === 0 ? 100 : Math.round((delta / previous) * 100)
  const up = delta >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {up ? '▲' : '▼'} {Math.abs(pct)}%
      <span className="text-[10px] font-normal opacity-70">vs last week</span>
    </span>
  )
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-blue-50/40 to-indigo-50/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08)_0%,transparent_50%)] animate-aurora"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.05)_0%,transparent_50%)] animate-aurora" style={{animationDelay: '10s'}}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-200/15 to-indigo-300/15 rounded-full blur-2xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-200/10 to-blue-300/10 rounded-full blur-2xl animate-float" style={{animationDelay: '5s'}}></div>

      {/* Navigation Header */}
      <nav className="relative z-20 glass-card border-0 rounded-none backdrop-blur-xl border-b shadow-soft animate-fade-in-down overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-4 lg:gap-6 min-w-0">
              <div className="flex items-center gap-4 animate-fade-in-right">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-glow-primary transform hover:rotate-12 transition-all duration-500 hover:scale-110">
                  <span className="text-2xl animate-float">🎭</span>
                </div>
                <div className="shrink-0">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gradient leading-tight">
                    Admin Portal
                  </h1>
                  <p className="text-sm text-slate-500 font-medium hidden lg:block">Management Dashboard</p>
                </div>
              </div>

              <nav className="ml-1 lg:ml-4 xl:ml-8 flex space-x-1 lg:space-x-2">
                <Link href="/admin" className="nav-link nav-link-active font-semibold animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                  🏠 Dashboard
                </Link>

                {/* Content Management */}
                <div className="relative group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <button type="button" className="nav-link flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300" aria-haspopup="menu" aria-label="Open Content menu">
                    📋 Content
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 pt-2 glass-card rounded-xl shadow-xl border border-white/20 min-w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 z-50">
                    <div className="p-2">
                      <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">👥</span>
                        <span className="font-medium">Users</span>
                      </Link>
                      <Link href="/admin/images" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-green-50 hover:text-green-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">🖼️</span>
                        <span className="font-medium">Images</span>
                      </Link>
                      <Link href="/admin/captions" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">💬</span>
                        <span className="font-medium">Captions</span>
                      </Link>
                      <Link href="/admin/caption-requests" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">📝</span>
                        <span className="font-medium">Requests</span>
                      </Link>
                      <Link href="/admin/caption-examples" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">💡</span>
                        <span className="font-medium">Examples</span>
                      </Link>
                      <Link href="/admin/ratings" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">🗳️</span>
                        <span className="font-medium">Ratings</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Humor System */}
                <div className="relative group animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                  <button type="button" className="nav-link flex items-center gap-2 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300" aria-haspopup="menu" aria-label="Open Humor menu">
                    🎭 Humor
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 pt-2 glass-card rounded-xl shadow-xl border border-white/20 min-w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 z-50">
                    <div className="p-2">
                      <Link href="/admin/humor-flavors" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">🎭</span>
                        <span className="font-medium">Humor Flavors</span>
                      </Link>
                      <Link href="/admin/humor-steps" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">⚡</span>
                        <span className="font-medium">Flavor Steps</span>
                      </Link>
                      <Link href="/admin/humor-mix" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pink-50 hover:text-pink-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">🔀</span>
                        <span className="font-medium">Humor Mix</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* AI/LLM Management */}
                <div className="relative group animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  <button type="button" className="nav-link flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300" aria-haspopup="menu" aria-label="Open AI and LLM menu">
                    🤖 AI/LLM
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 pt-2 glass-card rounded-xl shadow-xl border border-white/20 min-w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 z-50">
                    <div className="p-2">
                      <Link href="/admin/llm-providers" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">🏢</span>
                        <span className="font-medium">Providers</span>
                      </Link>
                      <Link href="/admin/llm-models" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">🤖</span>
                        <span className="font-medium">Models</span>
                      </Link>
                      <Link href="/admin/llm-chains" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-cyan-50 hover:text-cyan-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">🔗</span>
                        <span className="font-medium">Chains</span>
                      </Link>
                      <Link href="/admin/llm-responses" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">💬</span>
                        <span className="font-medium">Responses</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="relative group animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                  <button type="button" className="nav-link flex items-center gap-2 hover:bg-slate-50 hover:text-slate-600 transition-all duration-300" aria-haspopup="menu" aria-label="Open Settings menu">
                    ⚙️ Settings
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 pt-2 glass-card rounded-xl shadow-xl border border-white/20 min-w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 z-50">
                    <div className="p-2">
                      <Link href="/admin/terms" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">📚</span>
                        <span className="font-medium">Terms</span>
                      </Link>
                      <Link href="/admin/signup-domains" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">🌐</span>
                        <span className="font-medium">Domains</span>
                      </Link>
                      <Link href="/admin/whitelist-emails" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all duration-200">
                        <span className="text-lg">✉️</span>
                        <span className="font-medium">Emails</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            <div className="flex items-center space-x-8 animate-fade-in-left">
              <div className="flex items-center space-x-4 px-4 py-2 glass-card rounded-2xl hover:shadow-soft transition-all duration-300">
                {userAvatar && (
                  <div className="relative">
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-12 h-12 rounded-2xl ring-2 ring-primary-200/50 shadow-soft hover:ring-primary-300 transition-all duration-300 hover:scale-110"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-700">{userName}</p>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Super Administrator
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl font-medium shadow-soft hover:shadow-red-200 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {isLoggingOut ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>Signing out...</span>
                  </div>
                ) : (
                  <>
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <div className="glass-card rounded-3xl p-10 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-200/30 relative overflow-hidden hover:shadow-xl transition-all duration-500 glow-on-hover">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-shift"></div>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-glow-primary animate-pulse-soft">
                <span className="text-3xl">🎆</span>
              </div>
              <div>
                <h2 className="text-5xl font-bold text-gradient mb-4">
                  Welcome to the Control Center
                </h2>
                <p className="text-slate-600 text-xl leading-relaxed mb-4">
                  Advanced administrative interface for the Humor Project ecosystem. You have <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold">superadmin privileges</span> for complete system management.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100/80 text-green-700 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">System Online</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100/80 text-blue-700 rounded-lg">
                    <span>🔒</span>
                    <span className="font-medium">Secure Connection</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-100/80 text-purple-700 rounded-lg">
                    <span>⚡</span>
                    <span className="font-medium">Real-time Sync</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="card-modern p-8 animate-fade-in-up group hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Users</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.totalUsers.toLocaleString()}</p>
                {stats.weekly && (
                  <div className="mt-2 flex flex-col gap-1">
                    <DeltaBadge current={stats.weekly.users.thisWeek} previous={stats.weekly.users.lastWeek} />
                    <span className="text-[11px] text-slate-500">+{stats.weekly.users.thisWeek.toLocaleString()} this week</span>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-glow-primary group-hover:shadow-glow-lg group-hover:rotate-12 transition-all duration-500">
                <span className="text-3xl animate-float">👥</span>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
          </div>

          <div className="card-modern p-8 animate-fade-in-up group hover:scale-105 transition-all duration-500" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Images</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{stats.totalImages.toLocaleString()}</p>
                {stats.weekly && (
                  <div className="mt-2 flex flex-col gap-1">
                    <DeltaBadge current={stats.weekly.images.thisWeek} previous={stats.weekly.images.lastWeek} />
                    <span className="text-[11px] text-slate-500">+{stats.weekly.images.thisWeek.toLocaleString()} this week</span>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-glow-success group-hover:shadow-glow-lg group-hover:rotate-12 transition-all duration-500">
                <span className="text-3xl animate-float">🖼️</span>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
          </div>

          <div className="card-modern p-8 animate-fade-in-up group hover:scale-105 transition-all duration-500" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Captions</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{stats.totalCaptions.toLocaleString()}</p>
                {stats.weekly && (
                  <div className="mt-2 flex flex-col gap-1">
                    <DeltaBadge current={stats.weekly.captions.thisWeek} previous={stats.weekly.captions.lastWeek} />
                    <span className="text-[11px] text-slate-500">+{stats.weekly.captions.thisWeek.toLocaleString()} this week</span>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg group-hover:rotate-12 transition-all duration-500">
                <span className="text-3xl animate-float">💬</span>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"></div>
          </div>

          <Link
            href="/admin/ratings"
            className="card-modern p-8 animate-fade-in-up group hover:scale-105 transition-all duration-500 block relative"
            style={{ animationDelay: '0.3s' }}
          >
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity">View stats →</span>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Votes</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{stats.totalVotes.toLocaleString()}</p>
                {stats.weekly && (
                  <div className="mt-2 flex flex-col gap-1">
                    <DeltaBadge current={stats.weekly.votes.thisWeek} previous={stats.weekly.votes.lastWeek} />
                    <span className="text-[11px] text-slate-500">+{stats.weekly.votes.thisWeek.toLocaleString()} this week</span>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-glow-warning group-hover:shadow-glow-lg group-hover:rotate-12 transition-all duration-500">
                <span className="text-3xl animate-float">🗳️</span>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          </Link>
        </div>

        {/* Charts Section */}
        {stats.charts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            <div className="card-modern p-8 animate-fade-in-up hover:shadow-xl transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-glow">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient">Captions · Last 14 Days</h3>
                  <p className="text-slate-500 text-sm">Daily caption generation volume</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-slate-500 uppercase">Total</div>
                  <div className="text-lg font-bold text-purple-700 tabular-nums">
                    {stats.charts.captionsPerDay.reduce((a, b) => a + Number(b.c || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <MiniBarChart
                data={stats.charts.captionsPerDay.map((d) => ({ label: d.day, value: Number(d.c) }))}
                orientation="vertical"
                height={180}
                barColorClass="from-purple-500 to-violet-600"
                labelFormatter={(iso) => {
                  const d = new Date(iso)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
                emptyMessage="No captions in the last 14 days"
              />
            </div>

            <div className="card-modern p-8 animate-fade-in-up hover:shadow-xl transition-all duration-500 group" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-glow-primary">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient">New Users · Last 30 Days</h3>
                  <p className="text-slate-500 text-sm">Signups per day</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-slate-500 uppercase">Total</div>
                  <div className="text-lg font-bold text-blue-700 tabular-nums">
                    {stats.charts.usersPerDay.reduce((a, b) => a + Number(b.c || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <MiniBarChart
                data={stats.charts.usersPerDay.map((d) => ({ label: d.day, value: Number(d.c) }))}
                orientation="vertical"
                height={180}
                barColorClass="from-blue-500 to-indigo-600"
                labelFormatter={(iso) => {
                  const d = new Date(iso)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
                emptyMessage="No signups in the last 30 days"
              />
            </div>

            <div className="card-modern p-8 animate-fade-in-up hover:shadow-xl transition-all duration-500 group" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-glow">
                  <span className="text-xl">🎭</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient">Top Humor Flavors</h3>
                  <p className="text-slate-500 text-sm">Most-used flavors by caption count</p>
                </div>
              </div>
              <MiniBarChart
                data={stats.charts.topFlavors.map((f) => ({
                  label: f.slug,
                  value: Number(f.caption_count),
                }))}
                orientation="horizontal"
                barColorClass="from-pink-500 to-rose-600"
                emptyMessage="No flavor usage data"
              />
            </div>

            <div className="card-modern p-8 animate-fade-in-up hover:shadow-xl transition-all duration-500 group" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-glow-success">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient">Top LLM Models</h3>
                  <p className="text-slate-500 text-sm">Most-used models by response count</p>
                </div>
              </div>
              <MiniBarChart
                data={stats.charts.topModels.map((m) => ({
                  label: m.name,
                  subLabel: m.provider,
                  value: Number(m.uses),
                }))}
                orientation="horizontal"
                barColorClass="from-emerald-500 to-teal-600"
                emptyMessage="No model usage data"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Recent Activity */}
          <div className="card-modern p-8 animate-fade-in-up hover:shadow-xl transition-all duration-500 group" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-glow-primary group-hover:rotate-12 transition-transform duration-500">
                <span className="text-2xl animate-float">📝</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gradient">Recent Activity</h3>
                <p className="text-slate-500 text-sm">Latest user-generated captions</p>
              </div>
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
          <div className="card-modern p-8 animate-fade-in-up hover:shadow-xl transition-all duration-500 group" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-glow-warning group-hover:rotate-12 transition-transform duration-500">
                <span className="text-2xl animate-float">🏆</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gradient">Top Performers</h3>
                <p className="text-slate-500 text-sm">Most liked captions</p>
              </div>
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
        <div className="card-modern p-10 animate-fade-in hover:shadow-xl transition-all duration-500" style={{animationDelay: '0.6s'}}>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-600 rounded-3xl flex items-center justify-center shadow-glow-primary hover:rotate-12 transition-transform duration-500">
              <span className="text-3xl animate-float">⚡</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gradient">
                Quick Actions
              </h3>
              <p className="text-slate-500">Fast access to common management tasks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link
              href="/admin/users"
              className="group glass-card p-8 bg-gradient-to-br from-blue-50/80 to-blue-100/60 border border-blue-200/50 rounded-3xl hover:shadow-xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 glow-on-hover animate-fade-in-up"
              style={{animationDelay: '0.7s'}}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-glow-primary mb-4 group-hover:rotate-12 transition-transform duration-500">
                  <span className="text-3xl animate-float">👥</span>
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">User Management</h4>
                <p className="text-sm text-slate-600 leading-relaxed">View profiles, manage roles, and track user activity</p>
              </div>
            </Link>

            <Link
              href="/admin/images"
              className="group glass-card p-8 bg-gradient-to-br from-green-50/80 to-emerald-100/60 border border-green-200/50 rounded-3xl hover:shadow-xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 glow-on-hover animate-fade-in-up"
              style={{animationDelay: '0.8s'}}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-glow-success mb-4 group-hover:rotate-12 transition-transform duration-500">
                  <span className="text-3xl animate-float">🖼️</span>
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Image Library</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Upload, organize, and manage image assets</p>
              </div>
            </Link>

            <Link
              href="/admin/captions"
              className="group glass-card p-8 bg-gradient-to-br from-purple-50/80 to-violet-100/60 border border-purple-200/50 rounded-3xl hover:shadow-xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 glow-on-hover animate-fade-in-up"
              style={{animationDelay: '0.9s'}}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-glow mb-4 group-hover:rotate-12 transition-transform duration-500">
                  <span className="text-3xl animate-float">💬</span>
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Content Moderation</h4>
                <p className="text-sm text-slate-600 leading-relaxed">Review and moderate user-generated captions</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}