import { useState } from 'react'
import Modal from '../shared/Modal'
import SearchInput from '../shared/SearchInput'

export default function RecipePicker({ open, onClose, recipes, onSelect }) {
  const [search, setSearch] = useState('')
  const [portions, setPortions] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))

  function handleSelect(recipe) {
    setSelected(recipe)
    setPortions(String(recipe.portions_default ?? 10))
  }

  function handleAdd() {
    if (!selected || !portions) return
    onSelect(selected, Number(portions))
    setSelected(null)
    setPortions('')
    setSearch('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Dodaj jelo na event"
      footer={selected ? (
        <>
          <button className="btn btn-ghost" onClick={() => setSelected(null)}>Nazad</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!portions}>Dodaj</button>
        </>
      ) : null}
    >
      {!selected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Pretraži jela..." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem', maxHeight: '55vh', overflowY: 'auto' }}>
            {filtered.map((r) => (
              <button key={r.id} className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '.6rem .75rem' }} onClick={() => handleSelect(r)}>
                <span>{r.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>{r.category}</span>
              </button>
            ))}
            {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>Nema recepte</p>}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{selected.name}</div>
          <div className="form-group">
            <label>Broj porcija</label>
            <input type="number" min="1" value={portions} onChange={(e) => setPortions(e.target.value)} autoFocus />
          </div>
        </div>
      )}
    </Modal>
  )
}
