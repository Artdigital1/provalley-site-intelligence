import { useState } from 'react'
import NavBar from './components/NavBar'
import TabNav from './components/TabNav'
import Overview from './components/Overview'
import SearchPerf from './components/SearchPerf'
import CoreWebVitals from './components/CoreWebVitals'
import SiteAudit from './components/SiteAudit'
import Crawler from './components/Crawler'
import { SITES, MOCK_DATA } from './data'

const TABS = ['Overview', 'Search Performance', 'Core Web Vitals', 'Site Audit', 'Crawler']

export default function App() {
  const [activeSite, setActiveSite] = useState('kmg')
  const [activeTab, setActiveTab] = useState('Overview')

  const site = SITES.find(s => s.id === activeSite)
  const data = MOCK_DATA[activeSite]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavBar
        activeSite={activeSite}
        onSiteChange={(id) => { setActiveSite(id); setActiveTab('Overview') }}
      />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'Overview'            && <Overview data={data.overview} siteUrl={site.url} />}
          {activeTab === 'Search Performance'  && <SearchPerf data={data.searchPerf} siteUrl={site.url} />}
          {activeTab === 'Core Web Vitals'     && <CoreWebVitals mockData={data.cwv} siteUrl={site.url} />}
          {activeTab === 'Site Audit'          && <SiteAudit data={data.audit} siteUrl={site.url} />}
          {activeTab === 'Crawler'             && <Crawler siteUrl={site.url} />}
        </div>
      </div>

      {/* Phase badge */}
      <div className="fixed bottom-4 right-4">
        <span className="text-xs px-3 py-1.5 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-500/20">
          Phase 4 · Live
        </span>
      </div>
    </div>
  )
}
