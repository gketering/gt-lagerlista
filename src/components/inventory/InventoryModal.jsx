import { useState, useEffect } from 'react'
import Modal from '../shared/Modal'
import { UNITS } from '../../lib/utils'

const EMPTY = { name: '', category_id: '', unit: 'kg', min_qty: '', notes: '' }

export default function InventoryModal({ open, onClose, onSave, onAddCategory, item, categories }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)

  useEffect(() => {
    setForm(item ? {
      name: item.name ?? '',
      category_id: item.category_id ?? '',
      unit: item.unit ?? 'kg',
      min_qty: item.min_qty ?? '',
      notes: item.notes ?? '',
    } : EMPTY)
    setShowNewCat(false)
    setNewCatName('')
  }, [item, open])

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleAddCategory() {
    if (!newCatName.trim()) return
    setAddingCat(true)
    const newCat = await onAddCategory(newCatName)
    setAddingCat(false)
    if (newCat) { set('category_id', newCat.id); setNewCatName(''); setShowNewCat(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const ok = await onSave({
      name: form.name.trim(),
      category_id: form.category_id || null,
      unit: form.unit,
      min_qty: Number(form.min_qty) || 0,
      notes: form.notes || null,
    })
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Uredi stavku' : 'Nova stavka'}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Odustani</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !form.name.trim()}>
            {saving ? 'Čuvam...' : 'Sačuvaj'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '.45rem .75rem' }}>
          Količine i datumi unose se po stavci kroz <strong>unose robe</strong> nakon što sačuvaš.
        </div>
        <div className="form-group">
          <label>Naziv *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="npr. Piletina" autoFocus />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Kategorija</label>
            <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
              <option value="">— bez kategorije —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {!showNewCat ? (
              <button type="button" className="btn btn-ghost"
                style={{ marginTop: '.3rem', fontSize: '.8rem', color: 'var(--primary)', padding: '.2rem 0', justifyContent: 'flex-start' }}
                onClick={() => setShowNewCat(true)}>
                + Nova kategorija
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '.4rem', marginTop: '.3rem' }}>
                <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Naziv kategorije" autoFocus style={{ flex: 1 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() } if (e.key === 'Escape') setShowNewCat(false) }} />
                <button type="button" className="btn btn-primary" style={{ padding: '.55rem .8rem', flexShrink: 0 }}
                  onClick={handleAddCategory} disabled={addingCat || !newCatName.trim()}>
                  {addingCat ? '...' : 'Dodaj'}
                </button>
                <button type="button" className="btn btn-ghost" style={{ padding: '.55rem .6rem', flexShrink: 0 }}
                  onClick={() => { setShowNewCat(false); setNewCatName('') }}>✕</button>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Jedinica</label>
            <select value={form.unit} onChange={(e) => set('unit', e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Min. količina</label>
          <input type="number" min="0" step="0.01" value={form.min_qty} onChange={(e) => set('min_qty', e.target.value)} placeholder="0" />
        </div>
        <div className="form-group">
          <label>Napomena</label>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="..." />
        </div>
      </div>
    </Modal>
  )
}
