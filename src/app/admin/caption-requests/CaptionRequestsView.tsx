'use client'

import { useMemo, useState } from 'react'

interface RequestRow {
  id: number
  created_datetime_utc: string
  profile_id: string | null
  profile_email: string | null
  image_id: string | null
  image_url: string | null
  image_description: string | null
  caption_count: number
  response_count: number
  top_humor_flavor_slug: string | null
}

type FilterKey = 'all' | 'with_captions' | 'no_captions' | 'with_responses'
type SortKey = 'recent' | 'captions' | 'responses'

const PAGE_SIZE = 24

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export default function CaptionRequestsView({
  requests,
  totalRequests,
}: {
  requests: RequestRow[]
  totalRequests: number
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('recent')
  const [view, setView] = useState<'gallery' | 'table'>('gallery')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = requests.filter((r) => {
      if (q) {
        const hay = [
          r.profile_email,
          r.image_description,
          r.top_humor_flavor_slug,
          String(r.id),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filter === 'with_captions' && Number(r.caption_count) === 0) return false
      if (filter === 'no_captions' && Number(r.caption_count) > 0) return false
      if (filter === 'with_responses' && Number(r.response_count) === 0) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'captions') return Number(b.caption_count) - Number(a.caption_count)
      if (sort === 'responses') return Number(b.response_count) - Number(a.response_count)
      return new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()
    })
    return list
  }, [requests, search, filter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="card-modern p-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by id, email, flavor, or image description..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter</label>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as FilterKey); setPage(1) }}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="all">All requests</option>
            <option value="with_captions">✅ With captions</option>
            <option value="no_captions">⚠️ No captions</option>
            <option value="with_responses">🤖 With responses</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sort by</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="recent">Most recent</option>
            <option value="captions">Most captions</option>
            <option value="responses">Most responses</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">View</label>
          <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setView('gallery')}
              className={`px-3 py-2 text-sm font-medium ${view === 'gallery' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Gallery
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={`px-3 py-2 text-sm font-medium ${view === 'table' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{visible.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{filtered.length.toLocaleString()}</span>
          {requests.length < totalRequests && (
            <> &middot; loaded <span className="font-semibold text-slate-700">{requests.length.toLocaleString()}</span> of {totalRequests.toLocaleString()} total</>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-slate-600 tabular-nums">Page {safePage} / {totalPages}</span>
            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl">📋</span>
          <h3 className="text-lg font-medium text-neutral-900 mt-2">No matching requests</h3>
          <p className="text-neutral-600">Try adjusting filters or search.</p>
        </div>
      ) : view === 'gallery' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md hover:border-orange-300 transition-all duration-200 flex flex-col"
            >
              <div className="relative aspect-video bg-slate-100">
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.image_url}
                    alt={r.image_description || ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <span className="text-3xl">🖼️</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded">
                  #{r.id}
                </div>
                {r.top_humor_flavor_slug && (
                  <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-xs font-semibold px-2 py-1 rounded truncate max-w-[60%]" title={r.top_humor_flavor_slug}>
                    🎭 {r.top_humor_flavor_slug}
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <p className="text-sm text-slate-700 line-clamp-2 min-h-[2.5rem]">
                  {r.image_description || <span className="italic text-slate-400">No image description</span>}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <div className="text-[10px] uppercase text-emerald-700 font-bold tracking-wider">Captions</div>
                    <div className="text-lg font-bold text-emerald-900 tabular-nums">{Number(r.caption_count).toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
                    <div className="text-[10px] uppercase text-indigo-700 font-bold tracking-wider">Responses</div>
                    <div className="text-lg font-bold text-indigo-900 tabular-nums">{Number(r.response_count).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                  <span className="truncate" title={r.profile_email || 'Unknown'}>
                    👤 {r.profile_email || 'Unknown'}
                  </span>
                  <span className="shrink-0" title={new Date(r.created_datetime_utc).toLocaleString()}>
                    {timeAgo(r.created_datetime_utc)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Image</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Flavor</th>
                <th className="py-3 px-3 text-right">Captions</th>
                <th className="py-3 px-3 text-right">Responses</th>
                <th className="py-3 px-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50 align-middle">
                  <td className="py-3 px-3 font-mono text-sm text-slate-500">{r.id}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {r.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image_url} alt="" className="w-12 h-12 object-cover rounded-lg" loading="lazy" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-lg">🖼️</div>
                      )}
                      <p className="text-sm text-neutral-600 truncate max-w-xs">
                        {r.image_description || <span className="italic text-slate-400">—</span>}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-slate-700">{r.profile_email || 'Unknown'}</td>
                  <td className="py-3 px-3">
                    {r.top_humor_flavor_slug ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 truncate max-w-[160px] inline-block">
                        {r.top_humor_flavor_slug}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-emerald-800">{Number(r.caption_count).toLocaleString()}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-indigo-800">{Number(r.response_count).toLocaleString()}</td>
                  <td className="py-3 px-3 text-sm text-neutral-600" title={new Date(r.created_datetime_utc).toLocaleString()}>
                    {timeAgo(r.created_datetime_utc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
