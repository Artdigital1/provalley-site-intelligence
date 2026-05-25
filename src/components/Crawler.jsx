import { useState } from 'react'

const ISSUE_META = {
  missing_title:    { label: 'No Title',          color: 'red'    },
  title_too_long:   { label: 'Title Too Long',     color: 'amber'  },
  missing_meta_desc:{ label: 'No Meta Desc',       color: 'red'    },
  meta_desc_too_long:{ label:'Meta Desc Too Long', color: 'amber'  },
  missing_h1:       { label: 'No H1',              color: 'red'    },
  multiple_h1:      { label: 'Multiple H1',        color: 'amber'  },
  no_canonical:     { label: 'No Canonical',       color: 'amber'  },
  redirect:         { label: 'Redirect',           color: 'amber'  },
  '404':            { label: '404',                color: 'red'    },
  timeout:          { label: 'Timeout',            color: 'red'    },
  parse_error:      { label: 'Parse Error',        color: 'red'    },
}

const COLOR_CLS = {
  red:   'bg-red-500/10   text-red-400   border-red-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  slate: 'bg-slate-800    text-slate-400 border-slate-700',
}

function IssueBadge({ issue }) {
  const meta = ISSUE_META[issue] ?? { label: issue, color: 'slate' }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border whitespace-nowrap ${COLOR_CLS[meta.color]}`}>
      {meta.label}
    </span>
  )
}

function SummaryCard({ icon, label, value, highlight }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <div className={`text-2xl font-bold ${highlight && value > 0 ? 'text-red-400' : 'text-slate-100'}`}>
          {value}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function Crawler({ siteUrl }) {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error,  setError]  = useState(null)
  const [filter, setFilter] = useState('all')

  async function startCrawl() {
    setStatus('crawling')
    setResult(null)
    setError(null)
    setFilter('all')
    try {
      const res  = await fetch(`/api/crawl?siteUrl=${encodeURIComponent(siteUrl)}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setResult(json)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function exportCsv() {
    if (!result) return
    const headers = ['URL','Final URL','Status','Title','Meta Description','H1','H1 Count','Canonical','Word Count','Page Size (bytes)','Issues']
    const rows = result.pages.map(p => [
      p.url, p.finalUrl ?? '', p.status, p.title, p.metaDesc,
      p.h1, p.h1Count, p.canonical, p.wordCount, p.size,
      p.issues.join('; '),
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    const csv  = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `crawl-${new URL(siteUrl).hostname}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const allIssueTypes = result
    ? [...new Set(result.pages.flatMap(p => p.issues))].sort()
    : []

  const filtered = result
    ? filter === 'all'
      ? result.pages
      : result.pages.filter(p => p.issues.includes(filter))
    : []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Site Crawler</h2>
          <p className="text-slate-500 text-sm mt-0.5 font-mono">{siteUrl}</p>
        </div>
        <div className="flex items-center gap-3">
          {result && (
            <button
              onClick={exportCsv}
              className="text-xs px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
            >
              Export CSV ↓
            </button>
          )}
          <button
            onClick={startCrawl}
            disabled={status === 'crawling'}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
              status === 'crawling'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {status === 'crawling' ? 'Crawling…' : result ? 'Re-crawl' : 'Start Crawl'}
          </button>
        </div>
      </div>

      {/* Idle */}
      {status === 'idle' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-14 flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl">🕷️</div>
          <div>
            <div className="text-slate-200 font-medium text-base">On-demand SEO crawler</div>
            <div className="text-slate-500 text-sm mt-2 max-w-sm leading-relaxed">
              Crawls up to 50 pages and flags missing titles, meta descriptions, H1s, canonical tags, 404s, and redirects.
            </div>
          </div>
          <button
            onClick={startCrawl}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Start Crawl
          </button>
        </div>
      )}

      {/* Crawling */}
      {status === 'crawling' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-14 flex flex-col items-center gap-5">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <div className="text-slate-300 text-sm font-medium">Crawling {new URL(siteUrl).hostname}…</div>
            <div className="text-slate-600 text-xs mt-1">Up to 50 pages · may take 20–45 seconds</div>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-500/20 rounded-xl px-4 py-3">
          Crawl failed: {error}
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard icon="📄" label="Pages Crawled"  value={result.summary.totalPages}   />
            <SummaryCard icon="⚠️" label="With Issues"    value={result.summary.withIssues}   highlight />
            <SummaryCard icon="🚫" label="4xx Errors"     value={result.summary.errors4xx}    highlight />
            <SummaryCard icon="🔗" label="No Canonical"   value={result.summary.noCanonical}  highlight />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard icon="📝" label="Missing Title"  value={result.summary.missingTitle}  highlight />
            <SummaryCard icon="📋" label="Missing Meta"   value={result.summary.missingMeta}   highlight />
            <SummaryCard icon="📌" label="Missing H1"     value={result.summary.missingH1}     highlight />
            <SummaryCard icon="↩️" label="Redirects"      value={result.summary.redirects}              />
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
            >
              All ({result.summary.totalPages})
            </button>
            {allIssueTypes.map(issue => {
              const count = result.pages.filter(p => p.issues.includes(issue)).length
              return (
                <button
                  key={issue}
                  onClick={() => setFilter(issue)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    filter === issue
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {(ISSUE_META[issue]?.label ?? issue)} ({count})
                </button>
              )
            })}
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium w-8">#</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium min-w-[180px]">URL</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium min-w-[200px]">Title</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium min-w-[160px]">H1</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium w-16">Status</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium w-16 text-right">Words</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium min-w-[200px]">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((page, i) => {
                    const path = (() => { try { return new URL(page.url).pathname || '/' } catch { return page.url } })()
                    return (
                      <tr key={page.url} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-slate-600">{i + 1}</td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 truncate block"
                            title={page.url}
                          >
                            {path}
                          </a>
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <span
                            className={`truncate block ${page.title ? 'text-slate-300' : 'text-slate-600 italic'}`}
                            title={page.title}
                          >
                            {page.title || '(missing)'}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <span
                            className={`truncate block ${page.h1 ? 'text-slate-300' : 'text-slate-600 italic'}`}
                            title={page.h1}
                          >
                            {page.h1 || '(missing)'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-mono font-semibold ${
                            page.status >= 400 ? 'text-red-400'
                            : page.status >= 300 ? 'text-amber-400'
                            : page.status >= 200 ? 'text-emerald-400'
                            : 'text-slate-500'
                          }`}>
                            {page.status || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-right tabular-nums">
                          {page.wordCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {page.issues.length === 0
                              ? <span className="text-emerald-500 text-xs">✓ Clean</span>
                              : page.issues.map(iss => <IssueBadge key={iss} issue={iss} />)
                            }
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-10">
                  No pages match this filter.
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-600 text-right">
            Crawled {result.summary.totalPages} pages · {new Date(result.crawledAt).toLocaleString()}
          </div>
        </>
      )}
    </div>
  )
}
