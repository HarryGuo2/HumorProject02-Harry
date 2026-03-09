import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HumorFlavorsPage() {
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

  // Fetch humor flavors
  const { data: humorFlavors } = await supabase
    .from('humor_flavors')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

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
              <h1 className="text-2xl font-bold text-neutral-900">Humor Flavors</h1>
              <p className="text-neutral-600">View humor flavor types and configurations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Humor Flavors List */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎭</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Humor Flavors ({humorFlavors?.length || 0})</h2>
          </div>

          {!humorFlavors || humorFlavors.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🎭</span>
              <h3 className="text-lg font-medium text-neutral-900 mt-2">No humor flavors found</h3>
              <p className="text-neutral-600">Humor flavor configurations will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Slug</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {humorFlavors.map((flavor: any) => (
                    <tr key={flavor.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-mono text-sm">{flavor.id}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                          {flavor.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-700">{flavor.description || 'No description'}</td>
                      <td className="py-3 px-4 text-neutral-600">
                        {new Date(flavor.created_datetime_utc).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="card-modern p-6 mt-6 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-medium text-blue-900">About Humor Flavors</h3>
              <p className="text-blue-700 text-sm mt-1">
                Humor flavors define different types of humor styles used in caption generation.
                Each flavor has specific characteristics and processing steps that influence how captions are created.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}