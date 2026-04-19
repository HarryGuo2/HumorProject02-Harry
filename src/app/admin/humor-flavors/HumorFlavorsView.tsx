'use client'

import { useMemo, useState } from 'react'

interface Flavor {
  id: number
  slug: string
  description: string | null
  is_pinned: boolean
  created_datetime_utc: string
  step_count: number
  caption_count: number
}

type SortKey = 'recent' | 'captions' | 'steps' | 'slug'
type FilterKey = 'all' | 'pinned' | 'unused' | 'active'

const PAGE_SIZE = 24

export default function HumorFlavorsView({ flavors }: { flavors: Flavor[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('captions')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = flavors.filter((f) => {
      if (q) {
        const matchesSlug = f.slug?.toLowerCase().includes(q)
        const matchesDesc = f.description?.toLowerCase().includes(q)
        if (!matchesSlug && !matchesDesc) return false
      }
      if (filter === 'pinned' && !f.is_pinned) return false
      if (filter === 'unused' && Number(f.caption_count) > 0) return false
      if (filter === 'active' && Number(f.caption_count) === 0) return false
      return true
    })

    list = [...list].sort((a, b) => {
      if (sort === 'recent') {
        return new Date(b.created_datetime_utc).getTime() - new Date(a.created_datetime_utc).getTime()
      }
      if (sort === 'captions') return Number(b.caption_count) - Number(a.caption_count)
      if (sort === 'steps') return Number(b.step_count) - Number(a.step_count)
      if (sort === 'slug') return (a.slug || '').localeCompare(b.slug || '')
      return 0
    })

    return list
  }, [flavors, search, filter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetToFirst = () => setPage(1)

  return (
    <div className="card-modern p-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetToFirst() }}
            placeholder="Search slug or description..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter</label>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as FilterKey); resetToFirst() }}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="all">All flavors</option>
            <option value="pinned">📌 Pinned only</option>
            <option value="active">💬 With captions</option>
            <option value="unused">🚫 Unused (0 captions)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sort by</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="captions">Most captions</option>
            <option value="steps">Most steps</option>
            <option value="recent">Most recent</option>
            <option value="slug">Slug (A–Z)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">View</label>
          <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setView('cards')}
              className={`px-3 py-2 text-sm font-medium ${view === 'cards' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={`px-3 py-2 text-sm font-medium ${view === 'table' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
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
          {filtered.length !== flavors.length && (
            <> &middot; {flavors.length.toLocaleString()} total</>
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
            <span className="text-slate-600 tabular-nums">
              Page {safePage} / {totalPages}
            </span>
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
          <span className="text-4xl">🎭</span>
          <h3 className="text-lg font-medium text-neutral-900 mt-2">No matching flavors</h3>
          <p className="text-neutral-600">Try adjusting your search or filters.</p>
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md hover:border-purple-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-slate-400 shrink-0">#{f.id}</span>
                  <span
                    className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 truncate"
                    title={f.slug}
                  >
                    {f.slug}
                  </span>
                </div>
                {f.is_pinned && (
                  <span className="shrink-0 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">📌 pinned</span>
                )}
              </div>
              <p className="text-sm text-slate-700 min-h-[2.5rem] line-clamp-2 mb-3">
                {f.description || <span className="italic text-slate-400">No description</span>}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                  <div className="text-[10px] uppercase text-blue-700 font-bold tracking-wider">Steps</div>
                  <div className="text-lg font-bold text-blue-900 tabular-nums">{Number(f.step_count).toLocaleString()}</div>
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                  <div className="text-[10px] uppercase text-emerald-700 font-bold tracking-wider">Captions</div>
                  <div className="text-lg font-bold text-emerald-900 tabular-nums">{Number(f.caption_count).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Created {new Date(f.created_datetime_utc).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Steps</th>
                <th className="py-3 px-4 text-right">Captions</th>
                <th className="py-3 px-4">Pinned</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((f) => (
                <tr key={f.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4 font-mono text-sm text-slate-500">{f.id}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                      {f.slug}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-700 max-w-md truncate">{f.description || <span className="italic text-slate-400">—</span>}</td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-blue-800">{Number(f.step_count).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-emerald-800">{Number(f.caption_count).toLocaleString()}</td>
                  <td className="py-3 px-4">{f.is_pinned ? <span className="text-amber-600 font-semibold">📌 Yes</span> : <span className="text-slate-400">—</span>}</td>
                  <td className="py-3 px-4 text-neutral-600">{new Date(f.created_datetime_utc).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
