import { useState, useEffect } from 'react'

const STATUS = {
  good:                { label: 'Good',       cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  'needs-improvement': { label: 'Needs Work', cls: 'text-amber-400  bg-amber-400/10  border-amber-500/20',  dot: 'bg-amber-400'  },
  poor:                { label: 'Poor',       cls: 'text-red-400    bg-red-400/10    border-red-500/20',    dot: 'bg-red-400'    },
}

function scoreToStatus(score) {
  if (score === null || score === undefined) return 'poor'
  if (score >= 0.9) return 'good'
  if (score >= 0.5) return 'needs-improvement'
  return 'poor'
}

function parsePSI(json, strategy) {
  const audits = json?.lighthouseResult?.audits ?? {}
  const lcp   = audits['largest-contentful-paint']
  const cls   = audits['cumulative-layout-shift']
  const inp   = audits['interaction-to-next-paint'] ?? audits['total-blocking-time']
  const fcp   = audits['first-contentful-paint']
  const ttfb  = audits['server-response-time']

  const fmt = (ms) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`

  return {
    lcp:  { label: 'LCP',  value: lcp  ? fmt(lcp.numericValue)          : '—', status: scoreToStatus(lcp?.score),  threshold: '< 2.5s · 2.5–4s · > 4s' },
    cls:  { label: 'CLS',  value: cls  ? cls.numericValue.toFixed(3)     : '—', status: scoreToStatus(cls?.score),  threshold: '< 0.1 · 0.1–0.25 · > 0.25' },
    inp:  { label: 'INP',  value: inp  ? fmt(inp.numericValue)           : '—', status: scoreToStatus(inp?.score),  threshold: '< 200ms · 200–500ms · > 500ms' },
    fcp:  { label: 'FCP',  value: fcp  ? fmt(fcp.numericValue)           : '—', status: scoreToStatus(fcp?.score),  threshold: '< 1.8s · 1.8–3s · > 3s' },
    ttfb: { label: 'TTFB', value: ttfb ? fmt(ttfb.numericValue)          : '—', status: scoreToStatus(ttfb?.score), threshold: '< 800ms · 800ms–1.8s · > 1.8s' },
  }
}

function CWVCard({ metric }) {
  const s = STATUS[metric.status]
  return (
    <div className={`bg-slate-900 border rounded-xl p-5 flex flex-col gap-3 ${
      metric.status === 'good' ? 'border-slate-800' :
      metric.status === 'needs-improvement' ? 'border-amber-500/20' : 'border-red-500/20'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{metric.label}</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>
      <div className="text-3xl font-bold text-slate-100 leading-none">{metric.value}</div>
      <div className="text-xs text-slate-600">{metric.threshold}</div>
    </div>
  )
}

const PSI_KEY = import.meta.env.VITE_PSI_KEY

export default function CoreWebVitals({ mockData, siteUrl }) {
  const [realData, setRealData]   = useState(null)
  const [loading,  setLoading]    = useState(false)
  const [error,    setError]      = useState(null)
  const [strategy, setStrategy]   = useState('mobile')

  useEffect(() => {
    if (!PSI_KEY || !siteUrl) return
    setLoading(true)
    setError(null)
    setRealData(null)

    const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(siteUrl)}&strategy=${strategy}&key=${PSI_KEY}`

    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (json.error) throw new Error(json.error.message ?? 'PSI error')
        setRealData(parsePSI(json, strategy))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [siteUrl, strategy])

  const displayData = realData ?? mockData
  const metrics     = Object.values(displayData)
  const passing     = metrics.filter(m => m.status === 'good').length
  const total       = metrics.length
  const allGood     = passing === total
  const isLive      = !!PSI_KEY && !!realData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Core Web Vitals</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            PageSpeed Insights ·{' '}
            {loading ? 'Loading…' : isLive ? 'Live data' : 'Mock data'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Strategy toggle — only when key is set */}
          {PSI_KEY && (
            <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
              {['mobile', 'desktop'].map(s => (
                <button
                  key={s}
                  onClick={() => setStrategy(s)}
                  className={`px-3 py-1.5 capitalize transition-colors ${
                    strategy === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border ${
            allGood ? 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' : 'text-amber-400 bg-amber-400/10 border-amber-500/20'
          }`}>
            {loading ? '…' : allGood ? '✓ All Passing' : `${passing}/${total} Passing`}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          PSI fetch failed: {error} — showing mock data.
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, i) => <CWVCard key={i} metric={metric} />)}
        </div>
      )}

      {/* Thresholds reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-sm font-medium">Threshold Reference</span>
          {isLive && (
            <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live · {strategy}
            </span>
          )}
          {!PSI_KEY && (
            <span className="text-xs text-slate-600 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
              Mock data — add VITE_PSI_KEY for live
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Good',       cls: 'text-emerald-400 bg-emerald-400/10' },
            { label: 'Needs Work', cls: 'text-amber-400  bg-amber-400/10'  },
            { label: 'Poor',       cls: 'text-red-400    bg-red-400/10'    },
          ].map(b => (
            <div key={b.label} className={`${b.cls} px-3 py-2 rounded-lg text-center font-medium`}>
              {b.label}
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5 text-xs text-slate-500">
          <div className="flex justify-between"><span>LCP</span><span>&lt; 2.5s · 2.5–4s · &gt; 4s</span></div>
          <div className="flex justify-between"><span>CLS</span><span>&lt; 0.1 · 0.1–0.25 · &gt; 0.25</span></div>
          <div className="flex justify-between"><span>INP</span><span>&lt; 200ms · 200–500ms · &gt; 500ms</span></div>
          <div className="flex justify-between"><span>FCP</span><span>&lt; 1.8s · 1.8–3s · &gt; 3s</span></div>
          <div className="flex justify-between"><span>TTFB</span><span>&lt; 800ms · 800ms–1.8s · &gt; 1.8s</span></div>
        </div>
      </div>
    </div>
  )
}
