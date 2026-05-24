import { useState, useEffect } from 'react'

const RANGES = [
  { label: '7d',  value: 7  },
  { label: '28d', value: 28 },
  { label: '90d', value: 90 },
]

function SkeletonRow() {
  return (
    <tr>
      <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded animate-pulse w-48" /></td>
      <td className="px-5 py-4 text-right"><div className="h-4 bg-slate-800 rounded animate-pulse w-12 ml-auto" /></td>
      <td className="px-5 py-4 text-right hidden sm:table-cell"><div className="h-4 bg-slate-800 rounded animate-pulse w-16 ml-auto" /></td>
      <td className="px-5 py-4 text-right hidden md:table-cell"><div className="h-4 bg-slate-800 rounded animate-pulse w-12 ml-auto" /></td>
      <td className="px-5 py-4 text-right"><div className="h-4 bg-slate-800 rounded animate-pulse w-12 ml-auto" /></td>
    </tr>
  )
}

export default function SearchPerf({ data: mockData, siteUrl }) {
  const [rows,    setRows]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [range,   setRange]   = useState(28)
  const [isLive,  setIsLive]  = useState(false)

  useEffect(() => {
    if (!siteUrl) return
    setLoading(true)
    setError(null)
    setRows(null)
    setIsLive(false)

    fetch(`/api/gsc?siteUrl=${encodeURIComponent(siteUrl)}&range=${range}&limit=25`)
      .then(r => r.json())
      .then(json => {
        if (json.error) throw new Error(json.error)
        setRows(json.rows)
        setIsLive(true)
      })
      .catch(err => {
        // 503 = creds not set — silent fallback, not an error banner
        if (!err.message?.includes('not configured') && !err.message?.includes('503')) {
          setError(err.message)
        }
        setRows(null)
        setIsLive(false)
      })
      .finally(() => setLoading(false))
  }, [siteUrl, range])

  const displayRows = rows ?? mockData
  const maxClicks   = Math.max(...displayRows.map(r => r.clicks), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Search Performance</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Top queries · Google Search Console ·{' '}
            {loading ? 'Loading…' : isLive ? 'Live data' : 'Mock data'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Range toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 transition-colors ${
                  range === r.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* Live badge */}
          {isLive && (
            <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              Live · GSC
            </span>
          )}
        </div>
      </div>

      {/* Error banner (only for unexpected errors, not missing creds) */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          GSC fetch failed: {error} — showing mock data.
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left   text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3">Query</th>
              <th className="text-right  text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3">Clicks</th>
              <th className="text-right  text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Impressions</th>
              <th className="text-right  text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3 hidden md:table-cell">CTR</th>
              <th className="text-right  text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading
              ? [0,1,2,3,4].map(i => <SkeletonRow key={i} />)
              : displayRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors duration-100">
                  <td className="px-5 py-4">
                    <div className="text-slate-200 font-medium">{row.keyword ?? row.query}</div>
                    <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden w-32">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(row.clicks / maxClicks) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-slate-100 font-semibold">{row.clicks.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4 text-right hidden sm:table-cell">
                    <span className="text-slate-400">{row.impressions.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4 text-right hidden md:table-cell">
                    <span className="text-slate-400">
                      {typeof row.ctr === 'string' ? row.ctr : `${(row.ctr * 100).toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-semibold tabular-nums ${
                      row.position <= 3  ? 'text-emerald-400' :
                      row.position <= 10 ? 'text-amber-400'   : 'text-slate-400'
                    }`}>
                      #{typeof row.position === 'number' ? row.position.toFixed(1) : row.position}
                    </span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Top 3</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"  /> Top 10</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"  /> Page 2+</span>
      </div>
    </div>
  )
}
