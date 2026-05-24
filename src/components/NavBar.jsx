import { useState, useRef, useEffect } from 'react'
import { SITES } from '../data'

export default function NavBar({ activeSite, onSiteChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const site = SITES.find(s => s.id === activeSite)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold tracking-wide">PV</span>
          </div>
          <div className="leading-tight">
            <span className="text-slate-100 font-semibold text-sm">ProValley</span>
            <span className="text-slate-500 text-sm"> · Site Intelligence</span>
          </div>
        </div>

        {/* Site Switcher */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2.5 transition-all duration-150 min-w-[240px]"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-slate-100 text-sm font-medium leading-tight">{site.name}</div>
              <div className="text-slate-500 text-xs mt-0.5">{site.url.replace('https://', '')}</div>
            </div>
            <svg
              className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-700">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Switch Site</span>
              </div>
              {SITES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { onSiteChange(s.id); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 ${
                    s.id === activeSite ? 'bg-slate-700/60' : 'hover:bg-slate-700/40'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.id === activeSite ? 'bg-green-400' : 'bg-slate-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-100 text-sm font-medium">{s.name}</div>
                    <div className="text-slate-500 text-xs truncate">{s.url}</div>
                  </div>
                  {s.id === activeSite && (
                    <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
