import { useAppStore } from '../../store/useAppStore'

const TABS = [
  { id: 'inventory', icon: '📦', label: 'Lager' },
  { id: 'recipes',   icon: '🍽', label: 'Recepti' },
  { id: 'history',   icon: '📋', label: 'Izvještaj' },
]

export default function TabBar() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      height: 'var(--tab-h)',
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
    }}>
      {TABS.map((tab) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              color: active ? 'var(--primary)' : 'var(--text-dim)',
              fontSize: '.65rem', fontWeight: active ? 600 : 400,
              borderTop: active ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'color .15s',
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
