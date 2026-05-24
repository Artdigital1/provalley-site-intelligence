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

export default function Overview({ data: mock, siteUrl, ga4PropertyId }) {
  const [range,     setRange]     = useState(28)
  const [ga4Data,   setGa4Data]   = useState(null)
  const [ga4Error,  setGa4Error]  = useState(null)
  const [ga4Load,   setGa4Load]   = useState(false)
  const [gscData,   setGscData]   = useState(null)
  const [gscError,  setGscError]  = useState(null)
  const [gscLoad,   setGscLoad]   = useState(false)

  // GA4 fetch
  useEffect(() => {
    if (!ga4PropertyId) { setGa4Data(null); return }
    setGa4Load(true)
    setGa4Error(null)
    setGa4Data(null)
    fetch(`/api/ga4?propertyId=${encodeURIComponent(ga4PropertyId)}&range=${range}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) throw new Error(json.error)
        setGa4Data(json)
      })
      .catch(err => setGa4Error(err.message))
      .finally(() => setGa4Load(false))
  }, [ga4PropertyId, range])

  // GSC aggregate fetch
  useEffect(() => {
    if (!siteUrl) return
    setGscLoad(true)
    setGscError(null)
    setGscData(null)
    fetch(`/api/gsc?siteUrl=${encodeURIComponent(siteUrl)}&range=${range}&aggregate=true`)
      .then(r => r.json())
      .then(json => {
        if (json.error) throw new Error(json.error)
        setGscData(json)
      })
      .catch(err => setGscError(err.message))
      .finally(() => setGscLoad(false))
  }, [siteUrl, range])

  const periodLabel = `${range} days`
  const cwv = CWV_LABEL(mock.cwvScore.value)

  const ga4Live  = !!ga4Data
  const gscLive  = !!gscData
  const ga4Badge = ga4Live
    ? { text: 'Live · GA4', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' }
    : ga4PropertyId
      ? { text: ga4Error?.includes('503') || ga4Error?.includes('not configured') ? 'Mock — add creds' : ga4Error ? 'Error · Mock' : 'Loading…', cls: 'text-slate-500 bg-slate-800 border-slate-700' }
      : { text: 'Mock — set ga4PropertyId', cls: 'text-slate-600 bg-slate-900 border-slate-800' }
  const gscBadge = gscLive
    ? { text: 'Live · GSC', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' }
    : { text: gscError ? 'Error · Mock' : 'Mock data', cls: 'text-slate-500 bg-slate-800 border-slate-700' }

  // Formatted values for GA4 section
  const fmtN = n => n?.toLocaleString() ?? '—'
  const sessions    = ga4Live ? fmtN(ga4Data.sessions)    : mock.sessions.value
  const users       = ga4Live ? fmtN(ga4Data.users)       : mock.users.value
  const conversions = ga4Live ? fmtN(ga4Data.conversions) : mock.conversions.value
  const sessChange  = ga4Live ? ga4Data.changes?.sessions    : mock.sessions.change
  const userChange  = ga4Live ? ga4Data.changes?.users       : mock.users.change
  const convChange  = ga4Live ? ga4Data.changes?.conversions : mock.conversions.change

  // Formatted values for GSC section
  const clicks      = gscLive ? fmtN(gscData.clicks)      : mock.clicks.value
  const impressions = gscLive ? fmtN(gscData.impressions)  : mock.impressions.value
  const avgPosition = gscLive ? String(gscData.avgPosition) : mock.avgPosition.value

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Overview</h2>
          <p className="text-slate-500 text-sm mt-0.5">Last {range} days</p>
        </div>
        {/* Date range toggle */}
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

      {/* GA4 section */}
      <div className="space-y-3">
        <SectionLabel title="Analytics" badge={ga4Badge} />
        {ga4Error && !ga4Error.includes('not configured') && !ga4Error.includes('503') && (
          <div className="text-xs text-red-400 bg-red-400/10 border border-red-500/20 rounded-lg px-3 py-2">
            GA4: {ga4Error}
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {ga4Load ? (
            [0,1,2].map(i => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Sessions"    value={sessions}    change={sessChange} period={periodLabel} icon="👥" iconBg="bg-blue-500/10"   />
              <StatCard label="Users"       value={users}       change={userChange} period={periodLabel} icon="🧑" iconBg="bg-indigo-500/10" />
              <StatCard label="Conversions" value={conversions} change={convChange} period={periodLabel} icon="🎯" iconBg="bg-violet-500/10" />
            </>
          )}
        </div>
      </div>

      {/* GSC section */}
      <div className="space-y-3">
        <SectionLabel title="Search Console" badge={gscBadge} />
        {gscError && !gscError.includes('not configured') && !gscError.includes('503') && (
          <div className="text-xs text-red-400 bg-red-400/10 border border-red-500/20 rounded-lg px-3 py-2">
            GSC: {gscError}
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {gscLoad ? (
            [0,1,2,3].map(i => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Clicks"       value={clicks}      change={gscLive ? null : mock.clicks.change}      period={periodLabel} icon="🖱️" iconBg="bg-cyan-500/10"   />
              <StatCard label="Impressions"  value={impressions}  change={gscLive ? null : mock.impressions.change}  period={periodLabel} icon="👁️" iconBg="bg-teal-500/10"  />
              <StatCard label="Avg Position" value={avgPosition}  change={gscLive ? null : mock.avgPosition.change}  period={periodLabel} lowerIsBetter icon="📍" iconBg="bg-amber-500/10" />
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
                {sessions} sessions · {users} users.
                {ga4Live && ga4Data.changes.sessions != null
                  ? ` Sessions ${ga4Data.changes.sessions > 0 ? 'up' : 'down'} ${Math.abs(ga4Data.changes.sessions)}% vs. prior ${range} days.`
                  : ` Impressions ${gscLive ? '' : mock.impressions.change > 0 ? 'growing' : 'declining'} — organic visibility ${gscLive ? 'tracked live' : 'expanding'}.`}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-amber-500 self-stretch flex-shrink-0" />
            <div>
              <div className="text-slate-300 text-sm font-medium">Search Position</div>
              <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                Average position {avgPosition} —{' '}
                {gscLive
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
