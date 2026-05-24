export default function SearchPerf({ data }) {
  const maxClicks = Math.max(...data.map(r => r.clicks))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-100 font-semibold text-lg">Search Performance</h2>
          <p className="text-slate-500 text-sm mt-0.5">Top keywords · Google Search Console · Mock data</p>
        </div>
        <span className="text-xs text-slate-600 border border-slate-800 rounded-full px-3 py-1">
          Last 28 days
        </span>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3">Keyword</th>
              <th className="text-right text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3">Clicks</th>
              <th className="text-right text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Impressions</th>
              <th className="text-right text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3 hidden md:table-cell">CTR</th>
              <th className="text-right text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-3">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/50 transition-colors duration-100">
                <td className="px-5 py-4">
                  <div className="text-slate-200 font-medium">{row.keyword}</div>
                  {/* Click volume bar */}
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
                  <span className="text-slate-400">{row.ctr}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`font-semibold tabular-nums ${
                    row.position <= 3  ? 'text-emerald-400' :
                    row.position <= 10 ? 'text-amber-400' :
                    'text-slate-400'
                  }`}>
                    #{row.position.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Top 3</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Top 10</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Page 2+</span>
      </div>
    </div>
  )
}
