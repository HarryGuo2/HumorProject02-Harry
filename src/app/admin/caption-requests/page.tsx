import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CaptionRequestsPage() {
  const supabase = await createClient()

  // Check authentication and authorization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) {
    redirect('/unauthorized')
  }

  const { count: totalRequests } = await supabase
    .from('caption_requests')
    .select('*', { count: 'exact', head: true })

  const { data: captionRequests, error: requestsError } = await supabase
    .from('caption_requests')
    .select(`
      *,
      profiles (
        id,
        email
      ),
      images (
        id,
        url,
        image_description
      )
    `)
    .order('created_datetime_utc', { ascending: false })
    .limit(500)

  if (requestsError) {
    console.error('Error fetching caption requests:', requestsError)
  }

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
              <h1 className="text-2xl font-bold text-neutral-900">Caption Requests</h1>
              <p className="text-neutral-600">View API requests for caption generation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">
              Caption Requests ({captionRequests?.length || 0}
              {totalRequests && totalRequests > (captionRequests?.length || 0)
                ? ` shown of ${totalRequests.toLocaleString()}`
                : ''}
              )
            </h2>
          </div>

          {!captionRequests || captionRequests.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📋</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">No caption requests yet</h3>
              <p className="text-neutral-600">Caption generation requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Request ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Image</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {captionRequests.map((request: any) => (
                    <tr key={request.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-mono text-sm">{request.id}</td>
                      <td className="py-3 px-4">{request.profiles?.email || 'Unknown'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {request.images?.url && (
                            <img src={request.images.url} alt="" className="w-12 h-12 object-cover rounded-lg" />
                          )}
                          <div>
                            <p className="text-sm text-neutral-600 truncate max-w-xs">
                              {request.images?.image_description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {new Date(request.created_datetime_utc).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}