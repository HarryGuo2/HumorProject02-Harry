'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    // Use explicit URLs to avoid Site URL dependency
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    const redirectUrl = isLocalhost
      ? 'http://localhost:3000/auth/callback'
      : 'https://humor-project02-harry.vercel.app/auth/callback'

    console.log('Redirecting to:', redirectUrl) // Debug log

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })
    if (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-accent-50/60 to-neutral-50/70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1)_0%,transparent_50%)] animate-pulse-soft"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.1)_0%,transparent_50%)] animate-pulse-soft" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-primary-300/20 to-accent-400/20 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-accent-300/20 to-primary-400/20 rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-gradient-to-br from-success-300/15 to-warning-300/15 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-lg">
            <div className="glass-card p-8 lg:p-10 transform hover:scale-105 transition-all duration-500 glow-on-hover">
              {/* Success Icon */}
              <div className="text-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-success-400 to-success-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-success transform hover:rotate-12 transition-transform duration-300">
                    <span className="text-4xl animate-bounce-soft">✨</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-sm">✓</span>
                  </div>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-3 animate-fade-in-up">
                  Welcome Back!
                </h1>

                <div className="bg-gradient-to-r from-success-50/80 to-primary-50/80 backdrop-blur-sm border border-success-200/50 rounded-2xl p-4 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <p className="text-success-700 font-medium">
                    <span className="block text-sm opacity-80 mb-1">Authenticated as</span>
                    <span className="text-lg font-bold">{user.email}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <a
                  href="/admin"
                  className="btn-primary w-full flex items-center justify-center gap-3 text-lg animate-fade-in-up group"
                  style={{animationDelay: '0.3s'}}
                >
                  <span className="text-2xl group-hover:animate-wiggle transition-transform">🚀</span>
                  Launch Admin Panel
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="btn-secondary flex items-center justify-center gap-2 animate-fade-in-up"
                    style={{animationDelay: '0.4s'}}
                  >
                    <span>📊</span>
                    <span className="text-sm">Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary flex items-center justify-center gap-2 animate-fade-in-up hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
                    style={{animationDelay: '0.5s'}}
                  >
                    <span>🚪</span>
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-6 text-center animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-100/50 backdrop-blur-sm border border-success-200/50 rounded-full text-success-700 text-sm font-medium">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                System Status: Online
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background System */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1)_0%,transparent_50%)] animate-aurora"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(14,165,233,0.08)_0%,transparent_50%)] animate-aurora" style={{animationDelay: '10s'}}></div>
      </div>

      {/* Dynamic Floating Elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-32 right-16 w-56 h-56 bg-gradient-to-br from-purple-200/15 to-blue-300/15 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-cyan-200/25 to-sky-300/25 rounded-full blur-2xl animate-float" style={{animationDelay: '7s'}}></div>
      <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-300/20 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="glass-card p-10 lg:p-12 transform hover:scale-[1.02] transition-all duration-700 glow-on-hover">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="relative mb-8">
                <div className="w-28 h-28 bg-gradient-to-br from-primary-500 to-accent-600 rounded-3xl flex items-center justify-center mx-auto shadow-glow-primary transform hover:rotate-12 transition-transform duration-500">
                  <span className="text-5xl animate-float">🎭</span>
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center animate-bounce-soft">
                  <span className="text-xl">✨</span>
                </div>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gradient mb-4 animate-fade-in-up">
                Humor Project
              </h1>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent mb-3 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                Admin Portal
              </h2>
              <p className="text-slate-500 text-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                Advanced administrative interface for content management
              </p>
            </div>

            {/* Security Section */}
            <div className="mb-10">
              <div className="flex items-center justify-center mb-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-soft transform hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl animate-pulse-soft">🔐</span>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-slate-800 mb-6 text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                Secure Authentication Required
              </h3>

              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Enhanced Security Protocol</h4>
                    <p className="text-blue-700 leading-relaxed">
                      This administrative portal employs <span className="font-semibold">multi-factor authentication</span> through Google OAuth. Access is restricted to verified superadministrators with elevated privileges.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication Button */}
            <div className="text-center">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="btn-primary text-xl px-8 py-4 mb-6 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-fade-in-up"
                style={{animationDelay: '0.6s'}}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-dots mr-3">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    Authenticating with Google...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="mr-4 group-hover:animate-wiggle transition-transform">
                      <svg className="w-7 h-7" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <span>Authenticate with Google</span>
                    <div className="ml-3 opacity-70 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                )}
              </button>

              <div className="animate-fade-in" style={{animationDelay: '0.7s'}}>
                <p className="text-sm text-slate-500 mb-3">
                  Protected by enterprise-grade security protocols
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>OAuth 2.0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Multi-Factor Auth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}