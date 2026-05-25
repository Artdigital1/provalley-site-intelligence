import { useState, useEffect } from 'react'
import StatCard from './StatCard'

const RANGES = [
  { label: '7d',  value: 7  },
  { label: '28d', value: 28 },
  { label: '90d', value: 90 },
]

const CWV_LABEL = (score) => {
  if (score >= 90) return { text: 'Good',       cls: 'text-emerald-400 bg-emerald-400/10' }
  if (score >= 50) return { text: 'Needs Work', cls: 'text-amber-400  bg-amber-400/10'  }
  return                  { text: 'Poor',        cls: 'text-red-400    bg-red-400/10'    }
}
const CWV_COLOR = (score) => {
  if (score >= 90) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function SectionLabel({ title, badge }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</span>
      {badge && (
        <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.text}</span>
      )}
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-28 animate-pulse" />
}

function useLiveData(url, deps) {
  const [data,  setData]  = useState(null)
  const [error, setError] = useState(null)
  const [load,  setLoad]  = useState(false)

  useEffect(() => {
    if (!url) return
    setLoad(true)
    setError(null)
    setData(null)
    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (json.error) throw new Error(json.error)
        setData(json)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoad(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, load }
}

export default function Overview({ data: mock, siteUrl, ga4PropertyId }) {
  const [range, setRange] = useState(28)
  const periodLabel = `${range} days`

  const gsc = useLiveData(
    siteUrl ? `/api/gsc?siteUrl=${encodeURIComponent(siteUrl)}&range=${range}&aggregate=true` : null,
    [siteUrl, range],
  )
  const ga4 = useLiveData(
    ga4PropertyId ? `/api/ga4?propertyId=${ga4PropertyId}&range=${range}` : null,
    [ga4PropertyId, range],
  )

  const cwv = CWV_LABEL(mock.cwvScore.value)

  const gscBadge = gsc.data
    ? { text: 'Live · GSC', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' }
    : { text: gsc.error ? 'GSC Error' : 'Loading…', cls: 'text-slate-500 bg-slate-800 border-slate-700' }

  const ga4Badge = ga4.data
    ? { text: 'Live · GA4', cls: 'text-blue-400 bg-blue-400/10 border-blue-500/20' }
    : { text: ga4.error ? 'GA4 Error' : 'Loading…', cls: 'text-slate-500 bg-slate-800 border-slate-700' }

  const clicks      = gsc.data ? gsc.data.clicks.toLocaleString()     : mock.clicks.value
  const impressions = gsc.data ? gsc.data.impressions.toLocaleString() : mock.impressions.value
  const avgPosition = gsc.data ? String(gsc.data.avgPosition)          : mock.avgPosition.value

  const sessions    = ga4.data ? ga4.data.sessions.toLocaleString()    : mock.sessions?.value ?? '—'
  const users       = ga4.data ? ga4.data.users.toLocaleString()       : mock.users?.value    ?? '—'
  const conversions = ga4.data ? ga4.data.conversions.toLocaleString() : mock.conversions?.value ?? '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Overview</h2>
          <p className="text-slate-500 text-sm mt-0.5">Last {range} days</p>
        </div>
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
      </div>

      {/* Analytics — GA4 */}
      <div className="space-y-3">
        <SectionLabel title="Analytics" badge={ga4Badge} />
        {ga4.error && (
          <div className="text-xs text-red-400 bg-red-400/10 border border-red-500/20 rounded-lg px-3 py-2">
            GA4: {ga4.error}
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {ga4.load ? (
            [0, 1, 2].map(i => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Sessions"
                value={sessions}
                change={ga4.data ? ga4.data.changes.sessions : mock.sessions?.change}
                period={periodLabel}
                icon="📈"
                iconBg="bg-blue-500/10"
              />
              <StatCard
                label="Users"
                value={users}
                change={ga4.data ? ga4.data.changes.users : mock.users?.change}
                period={periodLabel}
                icon="👤"
                iconBg="bg-violet-500/10"
              />
              <StatCard
                label="Conversions"
                value={conversions}
                change={ga4.data ? ga4.data.changes.conversions : mock.conversions?.change}
                period={periodLabel}
                icon="🎯"
                iconBg="bg-emerald-500/10"
              />
            </>
          )}
        </div>
      </div>

      {/* GSC section */}
      <div className="space-y-3">
        <SectionLabel title="Search Console" badge={gscBadge} />
        {gsc.error && (
          <div className="text-xs text-red-400 bg-red-400/10 border border-red-500/20 rounded-lg px-3 py-2">
            GSC: {gsc.error}
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {gsc.load ? (
            [0, 1, 2, 3].map(i => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Clicks"       value={clicks}       change={gsc.data ? gsc.data.ctr   ? null : null : mock.clicks.change}      period={periodLabel} icon="🖱️" iconBg="bg-cyan-500/10"   />
              <StatCard label="Impressions"  value={impressions}  change={gsc.data ? null : mock.impressions.change}  period={periodLabel} icon="👁️" iconBg="bg-teal-500/10"  />
              <StatCard label="Avg Position" value={avgPosition}  change={gsc.data ? null : mock.avgPosition.change}  period={periodLabel} lowerIsBetter icon="📍" iconBg="bg-amber-500/10" />
              {/* CWV score */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors duration-150">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-xl">⚡</div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cwv.cls}`}>{cwv.text}</span>
                </div>
                <div>
                  <div className={`text-2xl font-bold leading-none ${CWV_COLOR(mock.cwvScore.value)}`}>
                    {mock.cwvScore.value}<span className="text-base text-slate-600 font-normal ml-1">/100</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1.5">CWV Score</div>
                  <div className="text-xs text-slate-700 mt-1">PageSpeed mobile</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="text-slate-400 text-sm font-medium mb-3">Quick Summary</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-blue-500 self-stretch flex-shrink-0" />
            <div>
              <div className="text-slate-300 text-sm font-medium">Traffic</div>
              <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                {ga4.data
                  ? `${sessions} sessions · ${users} users in the last ${range} days.`
                  : `Session analytics loading.`}
                {gsc.data
                  ? ` ${clicks} organic clicks.`
                  : ''}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-amber-500 self-stretch flex-shrink-0" />
            <div>
              <div className="text-slate-300 text-sm font-medium">Search Position</div>
              <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                Average position {avgPosition} —{' '}
                {gsc.data
                  ? `${impressions} impressions, ${clicks} clicks in the last ${range} days.`
                  : `${Math.abs(mock.avgPosition.change)} spot ${mock.avgPosition.change < 0 ? 'improvement' : 'decline'} vs. prior period.`}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className={`w-1 rounded-full self-stretch flex-shrink-0 ${mock.cwvScore.value >= 90 ? 'bg-emerald-500' : mock.cwvScore.value >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
            <div>
              <div className="text-slate-300 text-sm font-medium">Page Experience</div>
              <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                CWV score {mock.cwvScore.value}/100 — {cwv.text.toLowerCase()}.{' '}
                {mock.cwvScore.value < 90 ? 'Optimization opportunities — see Core Web Vitals tab.' : 'All metrics passing thresholds.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
