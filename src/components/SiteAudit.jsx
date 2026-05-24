import { useState } from 'react'

const ISSUE_STYLE = {
  error:   { icon: '✕', cls: 'text-red-400   bg-red-400/10   border-red-500/20',   dot: 'bg-red-400'   },
  warning: { icon: '!', cls: 'text-amber-400 bg-amber-400/10 border-amber-500/20', dot: 'bg-amber-400' },
  info:    { icon: 'i', cls: 'text-blue-400  bg-blue-400/10  border-blue-500/20',  dot: 'bg-blue-400'  },
}

const SCORE_COLOR = (s) => {
  if (s >= 90) return { text: 'text-emerald-400', ring: 'stroke-emerald-400', label: 'Excellent' }
  if (s >= 70) return { text: 'text-amber-400',   ring: 'stroke-amber-400',   label: 'Good'      }
  return               { text: 'text-red-400',     ring: 'stroke-red-400',     label: 'Needs Work' }
}

function ScoreRing({ score }) {
  const { text, ring, label } = SCORE_COLOR(score)
  const r    = 44
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            className={ring}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold leading-none ${text}`}>{score}</span>
          <span className="text-slate-600 text-xs mt-0.5">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-medium ${text}`}>{label}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 0) return <span className="text-xs font-mono text-red-400 bg-red-400/10 border border-red-500/20 px-2 py-0.5 rounded">timeout</span>
  const cls = status < 400 ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-red-400 bg-red-400/10 border-red-500/20'
  return <span className={`text-xs font-mono border px-2 py-0.5 rounded ${cls}`}>{status}</span>
}

export default function SiteAudit({ data, siteUrl }) {
  const [liveLinks,  setLiveLinks]  = useState(null)
  const [auditing,   setAuditing]   = useState(false)
  const [auditError, setAuditError] = useState(null)

  const errors   = data.issues.filter(i => i.type === 'error').length
  const warnings = data.issues.filter(i => i.type === 'warning').length

  async function runAudit() {
    setAuditing(true)
    setAuditError(null)
    setLiveLinks(null)
    try {
      const res = await fetch(`/api/audit?url=${encodeURIComponent(siteUrl)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setLiveLinks(json)
    } catch (err) {
      setAuditError(err.message)
    } finally {
      setAuditing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Site Audit</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {liveLinks
              ? `Scanned ${liveLinks.checkedCount} links · ${new Date(liveLinks.scannedAt).toLocaleString()}`
              : `Last scan: ${data.lastScan} · Mock data`}
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={auditing}
          className="text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 transition-colors"
        >
          {auditing ? 'Scanning…' : 'Run Audit'}
        </button>
      </div>

      {/* Score + summary row */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        <ScoreRing score={data.score} />
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 self-center">
          <div className="bg-slate-800/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{errors}</div>
            <div className="text-xs text-slate-500 mt-1">Errors</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{warnings}</div>
            <div className="text-xs text-slate-500 mt-1">Warnings</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-300">{data.issues.length}</div>
            <div className="text-xs text-slate-500 mt-1">Total Issues</div>
          </div>
        </div>
      </div>

      {/* Mock issues list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <span className="text-slate-400 text-sm font-medium">Issues Found</span>
        </div>
        <div className="divide-y divide-slate-800">
          {data.issues.map((issue, i) => {
            const s = ISSUE_STYLE[issue.type]
            return (
              <div key={i} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-800/30 transition-colors">
                <div className={`w-7 h-7 rounded-full ${s.cls} border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-200 font-medium text-sm">{issue.label}</span>
                    {issue.count > 1 && (
                      <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">
                        ×{issue.count}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{issue.detail}</p>
                </div>
                <div className={`text-xs font-medium capitalize px-2.5 py-1 rounded-full ${s.cls} border flex-shrink-0`}>
                  {issue.type}
                </div>
              </div>
            )
          })}
          {data.issues.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-600 text-sm">
              No issues found — site looks clean ✓
            </div>
          )}
        </div>
      </div>

      {/* Live broken link results */}
      {auditing && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 text-sm">Crawling {siteUrl}…</span>
        </div>
      )}

      {auditError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          Audit failed: {auditError}
        </div>
      )}

      {liveLinks && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">
              Broken Links
              {liveLinks.capped && (
                <span className="ml-2 text-xs text-slate-600">(capped at {liveLinks.checkedCount} of {liveLinks.totalFound} links found)</span>
              )}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              liveLinks.brokenLinks.length === 0
                ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20'
                : 'text-red-400 bg-red-400/10 border border-red-500/20'
            }`}>
              {liveLinks.brokenLinks.length === 0 ? 'All Clear' : `${liveLinks.brokenLinks.length} broken`}
            </span>
          </div>

          {liveLinks.brokenLinks.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-600 text-sm">
              No broken links detected ✓
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {liveLinks.brokenLinks.map((link, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <StatusBadge status={link.status} />
                  <span className="text-slate-400 text-xs font-mono truncate flex-1" title={link.url}>
                    {link.url}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
