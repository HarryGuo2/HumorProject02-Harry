'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface Image {
  id: string
  url: string
  image_description?: string
  is_public: boolean
  created_at: string
  user_id?: string
  captions?: { count: number }[]
  profiles?: { email: string }
}

interface Props {
  images: Image[]
  currentUser: any
}

export default function ImagesManagement({ images, currentUser }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPublic, setFilterPublic] = useState<'all' | 'public' | 'private'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [localImages, setLocalImages] = useState(images)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newImage, setNewImage] = useState({ url: '', description: '', isPublic: true })
  const supabase = createClient()

  const filteredImages = localImages.filter(image => {
    const matchesSearch = image.image_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.id.includes(searchTerm)

    const matchesFilter = filterPublic === 'all' ||
                         (filterPublic === 'public' && image.is_public) ||
                         (filterPublic === 'private' && !image.is_public)

    return matchesSearch && matchesFilter
  })

  const handleTogglePublic = async (imageId: string, currentStatus: boolean) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('images')
        .update({ is_public: !currentStatus })
        .eq('id', imageId)

      if (error) {
        throw error
      }

      setLocalImages(prev =>
        prev.map(image =>
          image.id === imageId
            ? { ...image, is_public: !currentStatus }
            : image
        )
      )

      alert(`Image marked as ${!currentStatus ? 'public' : 'private'}`)
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Failed to update image status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId)

      if (error) {
        throw error
      }

      setLocalImages(prev => prev.filter(image => image.id !== imageId))
      alert('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateImage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('images')
        .insert([
          {
            url: newImage.url,
            image_description: newImage.description,
            is_public: newImage.isPublic,
            user_id: currentUser.id
          }
        ])
        .select()

      if (error) {
        throw error
      }

      setLocalImages(prev => [data[0], ...prev])
      setNewImage({ url: '', description: '', isPublic: true })
      setShowCreateForm(false)
      alert('Image created successfully')
    } catch (error) {
      console.error('Error creating image:', error)
      alert('Failed to create image')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateDescription = async (imageId: string, newDescription: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('images')
        .update({ image_description: newDescription })
        .eq('id', imageId)

      if (error) {
        throw error
      }

      setLocalImages(prev =>
        prev.map(image =>
          image.id === imageId
            ? { ...image, image_description: newDescription }
            : image
        )
      )

      alert('Description updated successfully')
      setSelectedImage(null)
    } catch (error) {
      console.error('Error updating description:', error)
      alert('Failed to update description')
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
              <h1 className="text-xl font-semibold text-gray-900">🖼️ Image Management</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                + Create Image
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Image Library</h2>
          <p className="text-gray-600">
            Manage images and their visibility. Total images: {images.length}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search images by description, URL, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterPublic}
              onChange={(e) => setFilterPublic(e.target.value as 'all' | 'public' | 'private')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Images</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>
            <div className="text-sm text-gray-500">
              Showing {filteredImages.length} of {images.length} images
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={image.url}
                  alt={image.image_description || 'Image'}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                    const parent = (e.target as HTMLImageElement).parentElement
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500">Image not available</div>'
                    }
                  }}
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    image.is_public
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {image.is_public ? 'Public' : 'Private'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(image.captions as any)?.[0]?.count || 0} captions
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {image.image_description || 'No description'}
                </p>

                <p className="text-xs text-gray-500 mb-3">
                  ID: {image.id.substring(0, 8)}...<br/>
                  Created: {new Date(image.created_at).toLocaleDateString()}<br/>
                  By: {image.profiles?.email || 'Unknown'}
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="flex-1 bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-medium hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleTogglePublic(image.id, image.is_public)}
                    disabled={isLoading}
                    className={`flex-1 px-3 py-1 rounded text-xs font-medium ${
                      image.is_public
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {image.is_public ? 'Make Private' : 'Make Public'}
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={isLoading}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-medium hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500">
              {searchTerm || filterPublic !== 'all' ? 'No images found matching your criteria.' : 'No images found.'}
            </div>
          </div>
        )}
      </div>

      {/* Create Image Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Image</h3>
            <form onSubmit={handleCreateImage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={newImage.url}
                  onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newImage.description}
                  onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the image..."
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newImage.isPublic}
                    onChange={(e) => setNewImage(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Make image public</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Image'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Image</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const description = formData.get('description') as string
              handleUpdateDescription(selectedImage.id, description)
            }} className="space-y-4">
              <div>
                <img
                  src={selectedImage.url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={selectedImage.image_description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}