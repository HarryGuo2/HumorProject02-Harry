'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface Caption {
  id: string
  content: string
  like_count: number
  created_datetime_utc: string
  user_id: string
  image_id: string
  humor_flavor_id?: string
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
  const [localCaptions, setLocalCaptions] = useState(captions)
  const [selectedCaption, setSelectedCaption] = useState<Caption | null>(null)
  const supabase = createClient()

  const filteredAndSortedCaptions = localCaptions
    .filter(caption =>
      caption.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caption.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caption.id.includes(searchTerm)
    )
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
              <h1 className="text-xl font-semibold text-gray-900">💬 Caption Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">All Captions</h2>
          <p className="text-gray-600">
            Browse and moderate user-generated captions. Total captions: {captions.length}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search captions by content, author, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_liked">Most Liked</option>
              <option value="least_liked">Least Liked</option>
            </select>
            <div className="text-sm text-gray-500">
              Showing {filteredAndSortedCaptions.length} of {captions.length} captions
            </div>
          </div>
        </div>

        {/* Captions List */}
        <div className="space-y-4">
          {filteredAndSortedCaptions.map((caption) => {
            const voteStats = getVoteStats(caption)
            return (
              <div key={caption.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Image Preview */}
                    {caption.images?.url && (
                      <div className="flex-shrink-0">
                        <img
                          src={caption.images.url}
                          alt="Associated image"
                          className="w-20 h-20 object-cover rounded-lg"
                          onClick={() => setSelectedCaption(caption)}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    {/* Caption Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <blockquote className="text-lg text-gray-900 mb-2">
                            "{caption.content}"
                          </blockquote>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <span>👤 {caption.profiles?.email || 'Unknown'}</span>
                            <span>📅 {new Date(caption.created_datetime_utc).toLocaleDateString()}</span>
                            {caption.humor_flavors && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {caption.humor_flavors.slug}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">❤️ {caption.like_count || 0} likes</span>
                              <span className="text-sm text-gray-600">👍 {voteStats.upvotes} upvotes</span>
                              <span className="text-sm text-gray-600">👎 {voteStats.downvotes} downvotes</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 ml-4">
                          <button
                            onClick={() => setSelectedCaption(caption)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                      {caption.images?.image_description && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                          <strong>Image context:</strong> {caption.images.image_description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredAndSortedCaptions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500">
              {searchTerm ? 'No captions found matching your search.' : 'No captions found.'}
            </div>
          </div>
        )}
      </div>

      {/* Caption Details Modal */}
      {selectedCaption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">Caption Details</h3>
              <button
                onClick={() => setSelectedCaption(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Associated Image */}
              {selectedCaption.images?.url && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Associated Image</h4>
                  <img
                    src={selectedCaption.images.url}
                    alt="Associated image"
                    className="w-full max-h-64 object-contain rounded-lg bg-gray-100"
                  />
                  {selectedCaption.images.image_description && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Description:</strong> {selectedCaption.images.image_description}
                    </p>
                  )}
                </div>
              )}

              {/* Caption Content */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Caption</h4>
                <blockquote className="text-gray-800 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  "{selectedCaption.content}"
                </blockquote>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Author</h4>
                  <p className="text-sm text-gray-600">{selectedCaption.profiles?.email || 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedCaption.created_datetime_utc).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Likes</h4>
                  <p className="text-sm text-gray-600">{selectedCaption.like_count || 0}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Total Votes</h4>
                  <p className="text-sm text-gray-600">{getVoteStats(selectedCaption).total}</p>
                </div>
              </div>

              {selectedCaption.humor_flavors && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Humor Category</h4>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm inline-block">
                    {selectedCaption.humor_flavors.slug} - {selectedCaption.humor_flavors.description}
                  </div>
                </div>
              )}

              {/* Technical IDs */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Technical Information</h4>
                <div className="text-xs text-gray-600 font-mono space-y-1">
                  <div><strong>Caption ID:</strong> {selectedCaption.id}</div>
                  <div><strong>User ID:</strong> {selectedCaption.user_id}</div>
                  <div><strong>Image ID:</strong> {selectedCaption.image_id}</div>
                  {selectedCaption.humor_flavor_id && (
                    <div><strong>Humor Flavor ID:</strong> {selectedCaption.humor_flavor_id}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCaption(null)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
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