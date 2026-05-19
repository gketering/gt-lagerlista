import { useState } from 'react'
import Modal from '../shared/Modal'
import SearchInput from '../shared/SearchInput'

export default function IngredientPicker({ open, onClose, items, onSelect }) {
  const [search, setSearch] = useState('')

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Modal open={open} onClose={onClose} title="Odaberi artikal">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži artikle..." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem', maxHeight: '55vh', overflowY: 'auto' }}>
          <button
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start', padding: '.6rem .75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
            onClick={() => { onSelect(null); setSearch('') }}
          >
            ✏ Slobodan unos (nije vezan za lager)
          </button>
          {filtered.map((item) => (
            <button
              key={item.id}
              className="btn btn-ghost"
              style={{ justifyContent: 'space-between', padding: '.6rem .75rem' }}
              onClick={() => { onSelect(item); setSearch('') }}
            >
              <span>{item.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>{item.unit}</span>
            </button>
          ))}
          {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>Nema rezultata</p>}
        </div>
      </div>
    </Modal>
  )
}
