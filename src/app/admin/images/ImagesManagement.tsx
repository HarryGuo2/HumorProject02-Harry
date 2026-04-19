'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface Image {
  id: string
  url: string
  image_description?: string
  is_public: boolean
  created_datetime_utc: string
  profile_id?: string
  captions?: { count: number }[]
  profiles?: { email: string }
}

interface Props {
  images: Image[]
  totalCount?: number
  currentUser: any
}

export default function ImagesManagement({ images, totalCount, currentUser }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPublic, setFilterPublic] = useState<'all' | 'public' | 'private'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [localImages, setLocalImages] = useState(images)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url')
  const [newImage, setNewImage] = useState({
    url: '',
    description: '',
    isPublic: true
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed')
        return
      }

      setUploadedFile(file)
      setNewImage(prev => ({ ...prev, url: '' })) // Clear URL when file is selected
    }
  }

  const handleUploadFile = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `uploads/${fileName}`

    setUploadProgress(50) // Show progress during upload

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    setUploadProgress(100) // Complete progress

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  }

  const handleCreateImage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUploadProgress(0)

    try {
      let imageUrl = newImage.url

      // Handle file upload
      if (uploadMethod === 'file' && uploadedFile) {
        imageUrl = await handleUploadFile(uploadedFile)
      }

      if (!imageUrl) {
        alert('Please provide either a URL or upload a file')
        return
      }

      const { data, error } = await supabase
        .from('images')
        .insert([
          {
            url: imageUrl,
            image_description: newImage.description.trim() || null,
            is_public: newImage.isPublic,
            profile_id: currentUser.id
          }
        ])
        .select(`
          *,
          profiles (email)
        `)
        .single()

      if (error) throw error

      setLocalImages(prev => [data, ...prev])
      setNewImage({ url: '', description: '', isPublic: true })
      setUploadedFile(null)
      setUploadProgress(0)
      setShowCreateForm(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error creating image:', error)
      alert('Failed to create image: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePublic = async (imageId: string, currentStatus: boolean) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('images')
        .update({
          is_public: !currentStatus,
          modified_datetime_utc: new Date().toISOString()
        })
        .eq('id', imageId)

      if (error) throw error

      setLocalImages(prev =>
        prev.map(image =>
          image.id === imageId
            ? { ...image, is_public: !currentStatus }
            : image
        )
      )
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Failed to update image status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image? This will also delete all associated captions and cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      setLocalImages(prev => prev.filter(image => image.id !== imageId))
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage) return

    setIsLoading(true)
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const description = formData.get('description') as string
      const isPublic = formData.get('isPublic') === 'on'

      const { error } = await supabase
        .from('images')
        .update({
          image_description: description.trim() || null,
          is_public: isPublic,
          modified_datetime_utc: new Date().toISOString()
        })
        .eq('id', selectedImage.id)

      if (error) throw error

      setLocalImages(prev =>
        prev.map(image =>
          image.id === selectedImage.id
            ? { ...image, image_description: description.trim() || undefined, is_public: isPublic }
            : image
        )
      )
      setSelectedImage(null)
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Failed to update image')
    } finally {
      setIsLoading(false)
    }
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
                <h1 className="text-2xl font-bold text-neutral-900">Images Management</h1>
                <p className="text-neutral-600">Upload and manage images in the system</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              + Upload Image
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="card-modern p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search images by description, URL, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern"
              />
            </div>
            <select
              value={filterPublic}
              onChange={(e) => setFilterPublic(e.target.value as 'all' | 'public' | 'private')}
              className="input-modern w-auto"
            >
              <option value="all">All Images</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>
            <div className="text-sm text-neutral-600">
              {filteredImages.length} of {localImages.length.toLocaleString()} loaded
              {typeof totalCount === 'number' && totalCount > localImages.length && (
                <> · {totalCount.toLocaleString()} total in DB</>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card-modern p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🖼️</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">
              Image Library ({localImages.length.toLocaleString()}
              {typeof totalCount === 'number' && totalCount > localImages.length
                ? ` of ${totalCount.toLocaleString()}`
                : ''}
              )
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">Public Images</div>
              <div className="text-green-900 text-2xl font-bold">
                {localImages.filter(img => img.is_public).length}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-orange-600 text-sm font-medium">Private Images</div>
              <div className="text-orange-900 text-2xl font-bold">
                {localImages.filter(img => !img.is_public).length}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Total Captions</div>
              <div className="text-blue-900 text-2xl font-bold">
                {localImages.reduce((sum, img) => sum + ((img.captions?.[0] as any)?.count || 0), 0)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 text-sm font-medium">Recent Uploads</div>
              <div className="text-purple-900 text-2xl font-bold">
                {localImages.filter(img =>
                  new Date(img.created_datetime_utc) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="card-modern p-8 text-center">
            <span className="text-4xl">🖼️</span>
            <h3 className="text-lg font-medium text-neutral-900 mt-2">
              {localImages.length === 0 ? 'No images uploaded yet' : 'No images match your search'}
            </h3>
            <p className="text-neutral-600">
              {localImages.length === 0
                ? 'Upload your first image to get started.'
                : 'Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div key={image.id} className="card-modern overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-12 bg-neutral-100">
                  <img
                    src={image.url}
                    alt={image.image_description || 'Image'}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                      const parent = (e.target as HTMLImageElement).parentElement
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-48 bg-neutral-200 flex items-center justify-center text-neutral-500"><span class="text-4xl">🖼️</span><br/>Image not available</div>'
                      }
                    }}
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      image.is_public
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {image.is_public ? 'Public' : 'Private'}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {(image.captions?.[0] as any)?.count || 0} captions
                    </span>
                  </div>

                  <p className="text-sm text-neutral-700 mb-2 line-clamp-2 min-h-10">
                    {image.image_description || 'No description'}
                  </p>

                  <div className="text-xs text-neutral-500 mb-3 space-y-1">
                    <div>ID: {image.id.substring(0, 8)}...</div>
                    <div>Created: {new Date(image.created_datetime_utc).toLocaleDateString()}</div>
                    <div>By: {image.profiles?.email || 'Unknown'}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="flex-1 text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleTogglePublic(image.id, image.is_public)}
                      disabled={isLoading}
                      className={`flex-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        image.is_public
                          ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {image.is_public ? 'Make Private' : 'Make Public'}
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Image Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Upload New Image</h2>

            {/* Upload Method Selector */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMethod === 'url'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                🔗 From URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMethod === 'file'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                📁 Upload File
              </button>
            </div>

            <form onSubmit={handleCreateImage}>
              <div className="space-y-4">
                {uploadMethod === 'url' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL *</label>
                    <input
                      type="url"
                      value={newImage.url}
                      onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                      className="input-modern"
                      placeholder="https://example.com/image.jpg"
                      required={uploadMethod === 'url'}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Image File *</label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        required={uploadMethod === 'file'}
                      />
                      {uploadedFile ? (
                        <div>
                          <div className="text-green-600 mb-2">✓ {uploadedFile.name}</div>
                          <div className="text-sm text-neutral-600">
                            Size: {(uploadedFile.size / 1024 / 1024).toFixed(1)}MB
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedFile(null)}
                            className="text-sm text-red-600 hover:text-red-700 mt-2"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl mb-2">📁</div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Click to select image
                          </button>
                          <div className="text-sm text-neutral-500 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </div>
                        </div>
                      )}
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className="text-sm text-neutral-600 mt-1">Uploading... {uploadProgress.toFixed(0)}%</div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newImage.description}
                    onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                    className="input-modern min-h-20"
                    placeholder="Describe what's in this image..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newImage.isPublic}
                    onChange={(e) => setNewImage(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isPublic" className="text-sm text-neutral-700">
                    Make image public (visible to all users)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isLoading || (uploadMethod === 'file' && !uploadedFile) || (uploadMethod === 'url' && !newImage.url)}
                  className="btn-primary flex-1"
                >
                  {isLoading ? (uploadProgress > 0 ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Creating...') : 'Upload Image'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewImage({ url: '', description: '', isPublic: true })
                    setUploadedFile(null)
                    setUploadProgress(0)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
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

      {/* Edit Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Image</h2>
            <form onSubmit={handleUpdateImage}>
              <div className="space-y-4">
                <div>
                  <img
                    src={selectedImage.url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedImage.image_description || ''}
                    className="input-modern min-h-20"
                    placeholder="Describe what's in this image..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPublic"
                    id="editIsPublic"
                    defaultChecked={selectedImage.is_public}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="editIsPublic" className="text-sm text-neutral-700">
                    Make image public (visible to all users)
                  </label>
                </div>

                <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg">
                  <div><strong>Image ID:</strong> {selectedImage.id}</div>
                  <div><strong>Created:</strong> {new Date(selectedImage.created_datetime_utc).toLocaleString()}</div>
                  <div><strong>By:</strong> {selectedImage.profiles?.email || 'Unknown'}</div>
                  <div><strong>URL:</strong> <a href={selectedImage.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">View original</a></div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                  {isLoading ? 'Updating...' : 'Update Image'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="btn-secondary flex-1"
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