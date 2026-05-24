const STATUS = {
  good:             { label: 'Good',       cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  'needs-improvement': { label: 'Needs Work', cls: 'text-amber-400  bg-amber-400/10  border-amber-500/20',  dot: 'bg-amber-400' },
  poor:             { label: 'Poor',       cls: 'text-red-400    bg-red-400/10    border-red-500/20',    dot: 'bg-red-400' },
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

export default function CoreWebVitals({ data }) {
  const metrics = Object.values(data)
  const passing = metrics.filter(m => m.status === 'good').length
  const total = metrics.length
  const allGood = passing === total

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Core Web Vitals</h2>
          <p className="text-slate-500 text-sm mt-0.5">PageSpeed Insights · Mobile · Mock data</p>
        </div>
        <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border ${
          allGood ? 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' : 'text-amber-400 bg-amber-400/10 border-amber-500/20'
        }`}>
          {allGood ? '✓ All Passing' : `${passing}/${total} Passing`}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(data).map((metric, i) => (
          <CWVCard key={i} metric={metric} />
        ))}
      </div>

      {/* Thresholds reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="text-slate-400 text-sm font-medium mb-3">Threshold Reference</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Good',       cls: 'text-emerald-400 bg-emerald-400/10' },
            { label: 'Needs Work', cls: 'text-amber-400  bg-amber-400/10' },
            { label: 'Poor',       cls: 'text-red-400    bg-red-400/10' },
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
