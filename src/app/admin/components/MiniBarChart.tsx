'use client'

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
}

export default function MiniBarChart({
  data,
  orientation = 'vertical',
  height = 160,
  barColorClass = 'from-blue-500 to-indigo-600',
  labelFormatter,
  valueFormatter,
  emptyMessage = 'No data yet',
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.value), 1)
  const fmtValue = (v: number) => (valueFormatter ? valueFormatter(v) : v.toLocaleString())
  const fmtLabel = (l: string) => (labelFormatter ? labelFormatter(l) : l)

  if (orientation === 'horizontal') {
    return (
      <div className="space-y-3">
        {data.map((d) => {
          const pct = (d.value / max) * 100
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

  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d) => {
          const pct = (d.value / max) * 100
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="text-[10px] text-slate-500 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                {fmtValue(d.value)}
              </div>
              <div
                className={`w-full rounded-t-md bg-gradient-to-t ${barColorClass} transition-all duration-500 shadow-sm hover:shadow-md`}
                style={{ height: `${Math.max(pct, 3)}%`, minHeight: 4 }}
                title={`${fmtLabel(d.label)}: ${fmtValue(d.value)}`}
              />
            </div>
          )
        })}
      </div>
      <div className="flex items-start gap-1.5 mt-2">
        {data.map((d, idx) => (
          <div
            key={d.label}
            className={`flex-1 text-[10px] text-slate-500 text-center tabular-nums truncate ${
              data.length > 10 && idx % 2 !== 0 ? 'opacity-0' : ''
            }`}
            title={fmtLabel(d.label)}
          >
            {fmtLabel(d.label)}
          </div>
        ))}
      </div>
    </div>
  )
}
