import { useState, useEffect } from 'react'
import Modal from '../shared/Modal'

const EMPTY = { name: '', event_date: '', guest_count: '', location: '', notes: '' }

export default function EventModal({ open, onClose, onSave, event }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(event ? {
      name: event.name ?? '',
      event_date: event.event_date ?? '',
      guest_count: event.guest_count ?? '',
      location: event.location ?? '',
      notes: event.notes ?? '',
    } : EMPTY)
  }, [event, open])

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    if (!form.name.trim() || !form.event_date) return
    setSaving(true)
    const ok = await onSave({
      name: form.name.trim(),
      event_date: form.event_date,
      guest_count: form.guest_count ? Number(form.guest_count) : null,
      location: form.location || null,
      notes: form.notes || null,
    })
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={event ? 'Uredi event' : 'Novi event'}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Odustani</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !form.name.trim() || !form.event_date}>
            {saving ? 'Čuvam...' : 'Sačuvaj'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
        <div className="form-group">
          <label>Naziv *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="npr. Vjenčanje Marić" autoFocus />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Datum *</label>
            <input type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Gostiju</label>
            <input type="number" min="1" value={form.guest_count} onChange={(e) => set('guest_count', e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="form-group">
          <label>Lokacija</label>
          <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="npr. Dvorana Merkur" />
        </div>
        <div className="form-group">
          <label>Napomena</label>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="..." />
        </div>
      </div>
    </Modal>
  )
}
