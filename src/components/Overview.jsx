import StatCard from './StatCard'

const CWV_COLOR = (score) => {
  if (score >= 90) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

const CWV_LABEL = (score) => {
  if (score >= 90) return { text: 'Good', cls: 'text-emerald-400 bg-emerald-400/10' }
  if (score >= 50) return { text: 'Needs Work', cls: 'text-amber-400 bg-amber-400/10' }
  return { text: 'Poor', cls: 'text-red-400 bg-red-400/10' }
}

export default function Overview({ data }) {
  const cwv = CWV_LABEL(data.cwvScore.value)

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Overview</h2>
          <p className="text-slate-500 text-sm mt-0.5">Last 30 days · Mock data — Phase 2 API integration pending</p>
        </div>
        <span className="text-xs text-slate-600 border border-slate-800 rounded-full px-3 py-1">
          30-day window
        </span>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Sessions"
          value={data.sessions.value}
          change={data.sessions.change}
          icon="👥"
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="Clicks (GSC)"
          value={data.clicks.value}
          change={data.clicks.change}
          icon="🖱️"
          iconBg="bg-violet-500/10"
        />
        <StatCard
          label="Impressions"
          value={data.impressions.value}
          change={data.impressions.change}
          icon="👁️"
          iconBg="bg-cyan-500/10"
        />
        <StatCard
          label="Avg. Position"
          value={data.avgPosition.value}
          change={data.avgPosition.change}
          lowerIsBetter={true}
          icon="📍"
          iconBg="bg-amber-500/10"
        />
        {/* CWV card — custom */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors duration-150">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-xl">
              ⚡
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cwv.cls}`}>
              {cwv.text}
            </span>
          </div>
          <div>
            <div className={`text-2xl font-bold leading-none ${CWV_COLOR(data.cwvScore.value)}`}>
              {data.cwvScore.value}
              <span className="text-base text-slate-600 font-normal ml-1">/100</span>
            </div>
            <div className="text-sm text-slate-500 mt-1.5">CWV Score</div>
            <div className="text-xs text-slate-700 mt-1">PageSpeed mobile</div>
          </div>
        </div>
      </div>

      {/* Quick summary panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="text-slate-400 text-sm font-medium mb-3">Quick Summary</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-blue-500 self-stretch flex-shrink-0" />
            <div>
              <div className="text-slate-300 text-sm font-medium">Traffic</div>
              <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                Sessions and clicks trending {data.sessions.change > 0 ? 'up' : 'down'}.
                Impressions {data.impressions.change > 0 ? 'growing' : 'declining'} — organic visibility expanding.
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 rounded-full bg-amber-500 self-stretch flex-shrink-0" />
            <div>
              <div className="text-slate-300 text-sm font-medium">Search Position</div>
              <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                Average position {data.avgPosition.value} — {Math.abs(data.avgPosition.change)} spot{' '}
                {data.avgPosition.change < 0 ? 'improvement' : 'decline'} vs. prior period.
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className={`w-1 rounded-full self-stretch flex-shrink-0 ${data.cwvScore.value >= 90 ? 'bg-emerald-500' : data.cwvScore.value >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
            <div>
              <div className="text-slate-300 text-sm font-medium">Page Experience</div>
              <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                CWV score {data.cwvScore.value}/100 — {cwv.text.toLowerCase()}.{' '}
                {data.cwvScore.value < 90 ? 'Optimization opportunities available — see Core Web Vitals tab.' : 'All metrics passing thresholds.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
