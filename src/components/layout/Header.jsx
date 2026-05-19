import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import MenuModal from '../shared/MenuModal'

const TAB_LABELS = {
  inventory: 'Lager',
  recipes: 'Recepti',
  events: 'Eventi',
  history: 'Historija',
}

export default function Header() {
  const activeTab = useAppStore((s) => s.activeTab)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 'var(--header-h)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 1rem',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-.01em' }}>
          🗃 {TAB_LABELS[activeTab]}
        </span>
        <button className="btn btn-ghost" style={{ padding: '.4rem .6rem', fontSize: '1.2rem' }} onClick={() => setMenuOpen(true)}>
          ☰
        </button>
      </header>
      <MenuModal open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
