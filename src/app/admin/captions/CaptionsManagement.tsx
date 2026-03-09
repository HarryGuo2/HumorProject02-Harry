'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface Caption {
  id: string
  content: string
  like_count: number
  created_datetime_utc: string
  profile_id: string
  image_id: string
  humor_flavor_id?: number
  is_public: boolean
  is_featured: boolean
  profiles?: { email: string }
  images?: { url: string; image_description?: string }
  humor_flavors?: { slug: string; description: string }
  votes?: { vote_value: number }[]
}

interface Props {
  captions: Caption[]
  currentUser: any
}

export default function CaptionsManagement({ captions, currentUser }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked' | 'least_liked'>('newest')
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'regular'>('all')
  const [localCaptions, setLocalCaptions] = useState(captions)
  const [selectedCaption, setSelectedCaption] = useState<Caption | null>(null)
  const supabase = createClient()

  const filteredAndSortedCaptions = localCaptions
    .filter(caption => {
      const matchesSearch = caption.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          caption.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          caption.id.includes(searchTerm)

      const matchesFilter = filterFeatured === 'all' ||
                           (filterFeatured === 'featured' && caption.is_featured) ||
                           (filterFeatured === 'regular' && !caption.is_featured)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()
        case 'oldest':
          return new Date(a.created_datetime_utc).getTime() - new Date(b.created_datetime_utc).getTime()
        case 'most_liked':
          return (b.like_count || 0) - (a.like_count || 0)
        case 'least_liked':
          return (a.like_count || 0) - (b.like_count || 0)
        default:
          return 0
      }
    })

  const getVoteStats = (caption: Caption) => {
    const votes = caption.votes || []
    const upvotes = votes.filter(v => v.vote_value > 0).length
    const downvotes = votes.filter(v => v.vote_value < 0).length
    return { upvotes, downvotes, total: votes.length }
  }

  const totalCaptions = localCaptions.length
  const featuredCaptions = localCaptions.filter(c => c.is_featured).length
  const publicCaptions = localCaptions.filter(c => c.is_public).length
  const totalLikes = localCaptions.reduce((sum, c) => sum + (c.like_count || 0), 0)

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
              <h1 className="text-2xl font-bold text-neutral-900">Captions Management</h1>
              <p className="text-neutral-600">Browse and moderate user-generated captions</p>
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
                <span className="text-xl">💬</span>
              </div>
              <div>
                <div className="text-blue-600 text-sm font-medium">Total Captions</div>
                <div className="text-blue-900 text-2xl font-bold">{totalCaptions}</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <div className="text-purple-600 text-sm font-medium">Featured</div>
                <div className="text-purple-900 text-2xl font-bold">{featuredCaptions}</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🌐</span>
              </div>
              <div>
                <div className="text-green-600 text-sm font-medium">Public</div>
                <div className="text-green-900 text-2xl font-bold">{publicCaptions}</div>
              </div>
            </div>
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">❤️</span>
              </div>
              <div>
                <div className="text-orange-600 text-sm font-medium">Total Likes</div>
                <div className="text-orange-900 text-2xl font-bold">{totalLikes}</div>
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
                placeholder="Search captions by content, author, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input-modern w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_liked">Most Liked</option>
              <option value="least_liked">Least Liked</option>
            </select>
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value as typeof filterFeatured)}
              className="input-modern w-auto"
            >
              <option value="all">All Captions</option>
              <option value="featured">Featured Only</option>
              <option value="regular">Regular Only</option>
            </select>
            <div className="text-sm text-neutral-600">
              {filteredAndSortedCaptions.length} of {totalCaptions} captions
            </div>
          </div>
        </div>

        {/* Captions List */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">All Captions ({filteredAndSortedCaptions.length})</h2>
          </div>

          {filteredAndSortedCaptions.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">💬</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">
                {localCaptions.length === 0 ? 'No captions found' : 'No captions match your search'}
              </h3>
              <p className="text-neutral-600">
                {localCaptions.length === 0
                  ? 'User captions will appear here as they are created.'
                  : 'Try adjusting your search criteria or filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedCaptions.map((caption) => {
                const voteStats = getVoteStats(caption)
                return (
                  <div key={caption.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Image Preview */}
                      {caption.images?.url && (
                        <div className="flex-shrink-0">
                          <img
                            src={caption.images.url}
                            alt="Associated image"
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => setSelectedCaption(caption)}
                          />
                        </div>
                      )}

                      {/* Caption Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {caption.is_featured && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                  ⭐ Featured
                                </span>
                              )}
                              {!caption.is_public && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                  🔒 Private
                                </span>
                              )}
                              {caption.humor_flavors && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  {caption.humor_flavors.slug}
                                </span>
                              )}
                            </div>

                            <blockquote className="text-lg text-neutral-900 mb-3 font-medium leading-relaxed">
                              "{caption.content}"
                            </blockquote>

                            <div className="flex items-center gap-4 text-sm text-neutral-600 mb-2">
                              <span className="flex items-center gap-1">
                                <span>👤</span>
                                {caption.profiles?.email || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <span>📅</span>
                                {new Date(caption.created_datetime_utc).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-red-600">
                                <span>❤️</span>
                                {caption.like_count || 0} likes
                              </span>
                              <span className="flex items-center gap-1 text-green-600">
                                <span>👍</span>
                                {voteStats.upvotes} up
                              </span>
                              <span className="flex items-center gap-1 text-orange-600">
                                <span>👎</span>
                                {voteStats.downvotes} down
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedCaption(caption)}
                            className="text-primary-600 hover:text-primary-700 px-3 py-1 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>

                        {caption.images?.image_description && (
                          <div className="bg-neutral-50 p-3 rounded-lg">
                            <div className="text-xs font-medium text-neutral-700 mb-1">Image Context</div>
                            <div className="text-sm text-neutral-600">{caption.images.image_description}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Caption Details Modal */}
      {selectedCaption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Caption Details</h2>
              <button
                onClick={() => setSelectedCaption(null)}
                className="text-neutral-400 hover:text-neutral-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Image and Caption */}
              <div className="space-y-4">
                {selectedCaption.images?.url && (
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Associated Image</h3>
                    <img
                      src={selectedCaption.images.url}
                      alt="Associated image"
                      className="w-full rounded-lg bg-neutral-100"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Caption</h3>
                  <blockquote className="text-neutral-800 bg-neutral-50 p-4 rounded-lg border-l-4 border-primary-500 text-lg leading-relaxed">
                    "{selectedCaption.content}"
                  </blockquote>
                </div>

                {selectedCaption.images?.image_description && (
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Image Description</h3>
                    <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                      {selectedCaption.images.image_description}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Metadata */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-blue-600 text-sm font-medium">Author</div>
                    <div className="text-blue-900 font-medium">{selectedCaption.profiles?.email || 'Unknown'}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-green-600 text-sm font-medium">Created</div>
                    <div className="text-green-900 font-medium">
                      {new Date(selectedCaption.created_datetime_utc).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-red-600 text-sm font-medium">Likes</div>
                    <div className="text-red-900 text-2xl font-bold">{selectedCaption.like_count || 0}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-green-600 text-sm font-medium">Upvotes</div>
                    <div className="text-green-900 text-2xl font-bold">{getVoteStats(selectedCaption).upvotes}</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-orange-600 text-sm font-medium">Downvotes</div>
                    <div className="text-orange-900 text-2xl font-bold">{getVoteStats(selectedCaption).downvotes}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedCaption.is_featured && (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                      ⭐ Featured
                    </span>
                  )}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedCaption.is_public
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCaption.is_public ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>

                {selectedCaption.humor_flavors && (
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Humor Category</h3>
                    <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                      <div className="font-medium">{selectedCaption.humor_flavors.slug}</div>
                      <div className="text-sm">{selectedCaption.humor_flavors.description}</div>
                    </div>
                  </div>
                )}

                {/* Technical Information */}
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h3 className="font-medium text-neutral-900 mb-3">Technical Information</h3>
                  <div className="text-xs text-neutral-600 font-mono space-y-2">
                    <div><strong>Caption ID:</strong> {selectedCaption.id}</div>
                    <div><strong>Profile ID:</strong> {selectedCaption.profile_id}</div>
                    <div><strong>Image ID:</strong> {selectedCaption.image_id}</div>
                    {selectedCaption.humor_flavor_id && (
                      <div><strong>Humor Flavor ID:</strong> {selectedCaption.humor_flavor_id}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedCaption(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}