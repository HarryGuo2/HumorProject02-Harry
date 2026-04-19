import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MiniBarChart from '../components/MiniBarChart'

interface RatingSummary {
  total_votes: number
  unique_voters: number
  unique_captions_rated: number
  upvotes: number
  downvotes: number
  neutral_votes: number
  study_votes: number
  non_study_votes: number
  total_captions: number
  unrated_captions: number
  avg_votes_per_caption: number
  avg_votes_per_voter: number
}

interface VotePerDay { day: string; upvotes: number; downvotes: number; total: number }
interface TopRated { caption_id: string; content: string; humor_flavor_slug: string | null; profile_email: string | null; vote_count: number; net_score: number; upvotes: number; downvotes: number }
interface Controversial { caption_id: string; content: string; humor_flavor_slug: string | null; vote_count: number; upvotes: number; downvotes: number; net_score: number }
interface TopVoter { profile_id: string; email: string | null; vote_count: number; upvotes: number; downvotes: number; captions_rated: number }
interface FlavorRating { humor_flavor_id: number; humor_flavor_slug: string; vote_count: number; upvotes: number; downvotes: number; net_score: number; approval_pct: number }
interface Distribution { bucket: string; bucket_order: number; captions: number }

export default async function RatingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) redirect('/unauthorized')

  const [summaryRes, perDayRes, topRes, controversialRes, votersRes, flavorsRes, distributionRes] = await Promise.all([
    supabase.rpc('admin_rating_summary'),
    supabase.rpc('admin_votes_per_day', { days_back: 30 }),
    supabase.rpc('admin_top_rated_captions', { lim: 10 }),
    supabase.rpc('admin_controversial_captions', { lim: 10 }),
    supabase.rpc('admin_top_voters', { lim: 10 }),
    supabase.rpc('admin_rating_by_flavor', { lim: 10, min_votes: 20 }),
    supabase.rpc('admin_vote_distribution'),
  ])

  const summaryRows = (summaryRes.data as RatingSummary[] | null) || []
  const summary: RatingSummary = summaryRows[0] || {
    total_votes: 0, unique_voters: 0, unique_captions_rated: 0,
    upvotes: 0, downvotes: 0, neutral_votes: 0,
    study_votes: 0, non_study_votes: 0,
    total_captions: 0, unrated_captions: 0,
    avg_votes_per_caption: 0, avg_votes_per_voter: 0,
  }
  const perDay = (perDayRes.data as VotePerDay[] | null) || []
  const topRated = (topRes.data as TopRated[] | null) || []
  const controversial = (controversialRes.data as Controversial[] | null) || []
  const voters = (votersRes.data as TopVoter[] | null) || []
  const flavors = (flavorsRes.data as FlavorRating[] | null) || []
  const distribution = (distributionRes.data as Distribution[] | null) || []

  for (const [label, res] of [
    ['summary', summaryRes], ['perDay', perDayRes], ['top', topRes],
    ['controversial', controversialRes], ['voters', votersRes],
    ['flavors', flavorsRes], ['distribution', distributionRes],
  ] as const) {
    if (res.error) console.error(`ratings.${label} error:`, res.error)
  }

  const approvalPct = Number(summary.total_votes) > 0
    ? Math.round((Number(summary.upvotes) / Number(summary.total_votes)) * 100)
    : 0
  const coveragePct = Number(summary.total_captions) > 0
    ? Math.round((Number(summary.unique_captions_rated) / Number(summary.total_captions)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Caption Ratings</h1>
              <p className="text-neutral-600">Statistics about the captions users are rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top-line KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Votes</p>
            <p className="text-3xl font-bold text-orange-600 tabular-nums mt-1">{Number(summary.total_votes).toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 mt-1">across all captions</p>
          </div>
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unique Raters</p>
            <p className="text-3xl font-bold text-blue-700 tabular-nums mt-1">{Number(summary.unique_voters).toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 mt-1">avg {Number(summary.avg_votes_per_voter).toLocaleString()} votes / rater</p>
          </div>
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Captions Rated</p>
            <p className="text-3xl font-bold text-purple-700 tabular-nums mt-1">{Number(summary.unique_captions_rated).toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 mt-1">avg {Number(summary.avg_votes_per_caption).toLocaleString()} votes / caption</p>
          </div>
          <div className="card-modern p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coverage</p>
            <p className="text-3xl font-bold text-emerald-700 tabular-nums mt-1">{coveragePct}%</p>
            <p className="text-[11px] text-slate-500 mt-1">of {Number(summary.total_captions).toLocaleString()} captions rated</p>
          </div>
        </div>

        {/* Sentiment split */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-rose-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">⚖️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Sentiment split</h2>
              <p className="text-sm text-slate-500">Upvotes vs. downvotes across every rating</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs uppercase text-slate-500">Approval</div>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums">{approvalPct}%</div>
            </div>
          </div>
          {Number(summary.total_votes) > 0 && (
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                style={{ width: `${(Number(summary.upvotes) / Number(summary.total_votes)) * 100}%` }}
                title={`${Number(summary.upvotes).toLocaleString()} upvotes`}
              />
              {Number(summary.neutral_votes) > 0 && (
                <div
                  className="h-full bg-slate-400 transition-all duration-500"
                  style={{ width: `${(Number(summary.neutral_votes) / Number(summary.total_votes)) * 100}%` }}
                  title={`${Number(summary.neutral_votes).toLocaleString()} neutral`}
                />
              )}
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
                style={{ width: `${(Number(summary.downvotes) / Number(summary.total_votes)) * 100}%` }}
                title={`${Number(summary.downvotes).toLocaleString()} downvotes`}
              />
            </div>
          )}
          <div className="flex items-center gap-6 text-sm mt-3 text-slate-600">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-emerald-500"></span>👍 Upvotes: <span className="font-semibold text-emerald-700 tabular-nums">{Number(summary.upvotes).toLocaleString()}</span></span>
            {Number(summary.neutral_votes) > 0 && (
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-slate-400"></span>Neutral: <span className="font-semibold tabular-nums">{Number(summary.neutral_votes).toLocaleString()}</span></span>
            )}
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-rose-500"></span>👎 Downvotes: <span className="font-semibold text-rose-700 tabular-nums">{Number(summary.downvotes).toLocaleString()}</span></span>
            <span className="ml-auto text-slate-500 text-xs">📊 Study: {Number(summary.study_votes).toLocaleString()} · App: {Number(summary.non_study_votes).toLocaleString()}</span>
          </div>
        </div>

        {/* Trends + distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-modern p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Votes · Last 30 Days</h3>
                <p className="text-xs text-slate-500">Total daily rating activity</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs uppercase text-slate-500">30d total</div>
                <div className="text-lg font-bold text-blue-700 tabular-nums">{perDay.reduce((a, b) => a + Number(b.total || 0), 0).toLocaleString()}</div>
              </div>
            </div>
            <MiniBarChart
              data={perDay.map((d) => ({ label: d.day, value: Number(d.total) }))}
              orientation="vertical"
              height={180}
              barColorClass="from-blue-500 to-indigo-600"
              labelFormatter={(iso) => {
                const d = new Date(iso)
                return `${d.getMonth() + 1}/${d.getDate()}`
              }}
              emptyMessage="No votes in the last 30 days"
            />
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Rating Distribution</h3>
                <p className="text-xs text-slate-500">How many votes each rated caption received</p>
              </div>
            </div>
            <MiniBarChart
              data={distribution.map((d) => ({ label: d.bucket, value: Number(d.captions) }))}
              orientation="horizontal"
              barColorClass="from-fuchsia-500 to-pink-600"
              emptyMessage="No rated captions yet"
            />
          </div>
        </div>

        {/* Top flavors by approval */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎭</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Best-Rated Humor Flavors</h3>
              <p className="text-xs text-slate-500">Approval % among flavors with at least 20 votes</p>
            </div>
          </div>
          {flavors.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">Not enough votes yet to rank flavors.</div>
          ) : (
            <div className="space-y-3">
              {flavors.map((f) => {
                const pct = Number(f.approval_pct || 0)
                return (
                  <div key={f.humor_flavor_id} className="grid grid-cols-12 items-center gap-3 text-sm">
                    <div className="col-span-4 truncate font-medium text-slate-800" title={f.humor_flavor_slug}>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                        {f.humor_flavor_slug}
                      </span>
                    </div>
                    <div className="col-span-6">
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct >= 60 ? 'bg-gradient-to-r from-emerald-500 to-green-600' : pct >= 45 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 text-right text-xs text-slate-600 tabular-nums">
                      <span className="font-bold text-slate-800">{pct}%</span>
                      <span className="ml-1 text-slate-400">· {Number(f.vote_count).toLocaleString()} votes</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top rated & controversial captions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-modern p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Top Rated Captions</h3>
                <p className="text-xs text-slate-500">Highest net score (min 2 votes)</p>
              </div>
            </div>
            {topRated.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No rated captions yet.</div>
            ) : (
              <div className="space-y-3">
                {topRated.map((c, i) => (
                  <div key={c.caption_id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium line-clamp-2">{c.content}</p>
                      <div className="flex items-center gap-3 text-xs mt-2 text-slate-500 flex-wrap">
                        <span className="text-emerald-700 font-semibold tabular-nums">+{Number(c.net_score)}</span>
                        <span className="tabular-nums">👍 {Number(c.upvotes)}</span>
                        <span className="tabular-nums">👎 {Number(c.downvotes)}</span>
                        {c.humor_flavor_slug && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-semibold truncate max-w-[140px]">{c.humor_flavor_slug}</span>}
                        {c.profile_email && <span className="truncate text-slate-400">by {c.profile_email}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-modern p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Most Controversial</h3>
                <p className="text-xs text-slate-500">Captions that split the audience (≥4 votes, has both sides)</p>
              </div>
            </div>
            {controversial.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No controversial captions yet.</div>
            ) : (
              <div className="space-y-3">
                {controversial.map((c) => (
                  <div key={c.caption_id} className="p-3 rounded-lg border border-slate-100 bg-gradient-to-r from-rose-50 to-orange-50">
                    <p className="text-sm text-slate-800 font-medium line-clamp-2">{c.content}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs flex-wrap text-slate-500">
                      <span className="tabular-nums text-emerald-700 font-semibold">👍 {Number(c.upvotes)}</span>
                      <span className="tabular-nums text-rose-700 font-semibold">👎 {Number(c.downvotes)}</span>
                      <span className="tabular-nums">net {Number(c.net_score) > 0 ? '+' : ''}{Number(c.net_score)}</span>
                      <span className="tabular-nums text-slate-400">· {Number(c.vote_count)} votes</span>
                      {c.humor_flavor_slug && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-semibold truncate max-w-[140px]">{c.humor_flavor_slug}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top voters */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🗳️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Most Active Raters</h3>
              <p className="text-xs text-slate-500">Users casting the most votes</p>
            </div>
          </div>
          {voters.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">No voters yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">User</th>
                    <th className="py-2 px-3 text-right">Total</th>
                    <th className="py-2 px-3 text-right">👍 Up</th>
                    <th className="py-2 px-3 text-right">👎 Down</th>
                    <th className="py-2 px-3 text-right">Captions</th>
                    <th className="py-2 px-3">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((v, i) => {
                    const pct = Number(v.vote_count) > 0
                      ? Math.round((Number(v.upvotes) / Number(v.vote_count)) * 100)
                      : 0
                    return (
                      <tr key={v.profile_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3 tabular-nums text-slate-500">{i + 1}</td>
                        <td className="py-2 px-3 truncate max-w-[260px]" title={v.email || undefined}>{v.email || <span className="text-slate-400">—</span>}</td>
                        <td className="py-2 px-3 text-right tabular-nums font-semibold text-slate-800">{Number(v.vote_count).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-emerald-700">{Number(v.upvotes).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-rose-700">{Number(v.downvotes).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{Number(v.captions_rated).toLocaleString()}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-600" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs tabular-nums text-slate-600 w-10">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
