import { useState } from 'react'
import NavBar from './components/NavBar'
import TabNav from './components/TabNav'
import Overview from './components/Overview'
import SearchPerf from './components/SearchPerf'
import CoreWebVitals from './components/CoreWebVitals'
import SiteAudit from './components/SiteAudit'
import { MOCK_DATA } from './data'

const TABS = ['Overview', 'Search Performance', 'Core Web Vitals', 'Site Audit']

export default function App() {
  const [activeSite, setActiveSite] = useState('kmg')
  const [activeTab, setActiveTab] = useState('Overview')
  const data = MOCK_DATA[activeSite]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavBar activeSite={activeSite} onSiteChange={(id) => { setActiveSite(id); setActiveTab('Overview') }} />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'Overview'            && <Overview data={data.overview} />}
          {activeTab === 'Search Performance'  && <SearchPerf data={data.searchPerf} />}
          {activeTab === 'Core Web Vitals'     && <CoreWebVitals data={data.cwv} />}
          {activeTab === 'Site Audit'          && <SiteAudit data={data.audit} />}
        </div>
      </div>

      {/* Phase label */}
      <div className="fixed bottom-4 right-4">
        <span className="text-xs text-slate-600 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
          Phase 1 · Mock data
        </span>
      </div>
    </div>
  )
}
