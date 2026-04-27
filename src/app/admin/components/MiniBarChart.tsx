'use client'

import { useMemo, useState } from 'react'

interface BarChartItem {
  label: string
  value: number
  subLabel?: string
}

interface Props {
  data: BarChartItem[]
  orientation?: 'vertical' | 'horizontal'
  height?: number
  barColorClass?: string
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => string
  emptyMessage?: string
  showSummary?: boolean
}

export default function MiniBarChart({
  data,
  orientation = 'vertical',
  height = 180,
  barColorClass = 'from-blue-500 to-indigo-600',
  labelFormatter,
  valueFormatter,
  emptyMessage = 'No data yet',
  showSummary = true,
}: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const fmtValue = (v: number) => (valueFormatter ? valueFormatter(v) : v.toLocaleString('en-US'))
  const fmtLabel = (l: string) => (labelFormatter ? labelFormatter(l) : l)

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null
    const values = data.map((d) => d.value)
    const total = values.reduce((a, b) => a + b, 0)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const avg = total / values.length
    const peakIdx = values.findIndex((v) => v === max)
    return { total, max, min, avg, peakIdx }
  }, [data])

  if (!data || data.length === 0 || !stats) {
    return (
      <div className="text-center py-6 text-sm text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  if (orientation === 'horizontal') {
    return (
      <div className="space-y-3">
        {data.map((d) => {
          const pct = (d.value / Math.max(stats.max, 1)) * 100
          return (
            <div key={d.label} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="font-medium text-slate-700 truncate pr-2" title={fmtLabel(d.label)}>
                  {fmtLabel(d.label)}
                </div>
                <div className="text-slate-500 tabular-nums shrink-0">{fmtValue(d.value)}</div>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barColorClass} transition-all duration-500`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              {d.subLabel && <div className="text-[10px] text-slate-400 mt-0.5">{d.subLabel}</div>}
            </div>
          )
        })}
      </div>
    )
  }

  // --- vertical chart ---

  const labelStep = data.length <= 10 ? 1 : Math.ceil(data.length / 7)
  const hovered = hoverIdx !== null ? data[hoverIdx] : null

  return (
    <div>
      {showSummary && (
        <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-2 flex-wrap">
          <span>
            Peak <span className="font-bold text-slate-800 tabular-nums">{fmtValue(stats.max)}</span>
            {stats.peakIdx >= 0 && (
              <span className="text-slate-400"> on {fmtLabel(data[stats.peakIdx].label)}</span>
            )}
          </span>
          <span>
            Avg <span className="font-bold text-slate-800 tabular-nums">{fmtValue(Math.round(stats.avg))}</span>
          </span>
          <span>
            Low <span className="font-bold text-slate-800 tabular-nums">{fmtValue(stats.min)}</span>
          </span>
        </div>
      )}

      <div className="relative" style={{ height: height + 28 }}>
        {/* Y-axis gridlines with value labels */}
        <div className="absolute inset-0 pointer-events-none" style={{ paddingBottom: 28 }}>
          {[1, 0.75, 0.5, 0.25, 0].map((frac) => (
            <div
              key={frac}
              className="absolute left-0 right-0 border-t border-dashed border-slate-200"
              style={{ top: `${(1 - frac) * 100}%` }}
            >
              <span className="absolute -top-2 -translate-y-0 right-0 text-[10px] text-slate-400 tabular-nums bg-white pl-1">
                {fmtValue(Math.round(stats.max * frac))}
              </span>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div
          className="relative flex items-end gap-1 pr-8"
          style={{ height, paddingTop: 12 }}
        >
          {data.map((d, idx) => {
            const pct = stats.max > 0 ? (d.value / stats.max) * 100 : 0
            const isHover = hoverIdx === idx
            const isPeak = idx === stats.peakIdx && stats.max > 0
            return (
              <div
                key={`${d.label}-${idx}`}
                className="flex-1 h-full flex items-end relative"
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx((prev) => (prev === idx ? null : prev))}
              >
                <div
                  className={`w-full rounded-t-md bg-gradient-to-t ${barColorClass} transition-all duration-300 ${
                    isHover ? 'opacity-100 shadow-md' : isPeak ? 'opacity-100' : 'opacity-85'
                  } ${isHover || isPeak ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-100' : ''}`}
                  style={{
                    height: d.value > 0 ? `${Math.max(pct, 2)}%` : '0%',
                    minHeight: d.value > 0 ? 3 : 0,
                  }}
                  title={`${fmtLabel(d.label)}: ${fmtValue(d.value)}`}
                />
              </div>
            )
          })}
        </div>

        {/* X-axis labels (sparse) */}
        <div className="absolute left-0 right-8 flex gap-1" style={{ bottom: 0, height: 22 }}>
          {data.map((d, idx) => {
            const showLabel = idx % labelStep === 0 || idx === data.length - 1
            return (
              <div
                key={`lbl-${d.label}-${idx}`}
                className="flex-1 relative"
              >
                {showLabel && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 tabular-nums whitespace-nowrap">
                    {fmtLabel(d.label)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Hover tooltip */}
        {hovered && hoverIdx !== null && (
          <div
            className="absolute -top-1 bg-slate-900 text-white text-xs rounded-md px-2 py-1 shadow-lg pointer-events-none z-10 whitespace-nowrap"
            style={{
              left: `calc(${((hoverIdx + 0.5) / data.length) * 100}% - 40px)`,
              maxWidth: 200,
            }}
          >
            <div className="font-semibold">{fmtLabel(hovered.label)}</div>
            <div className="tabular-nums opacity-90">{fmtValue(hovered.value)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
