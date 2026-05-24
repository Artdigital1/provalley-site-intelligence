export default function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-1 border-b border-slate-800 pb-0">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2.5 text-sm font-medium rounded-t transition-all duration-150 border-b-2 -mb-px ${
            tab === activeTab
              ? 'text-blue-400 border-blue-500 bg-slate-900'
              : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/50'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
