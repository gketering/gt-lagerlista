import { useState, useEffect } from 'react'
import Modal from '../shared/Modal'

export default function WriteOffModal({ open, onClose, onSave, item }) {
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { setQty(''); setReason('') }
  }, [open])

  async function handleSave() {
    if (!qty || Number(qty) <= 0) return
    setSaving(true)
    const ok = await onSave(Number(qty), reason.trim() || 'Otpis')
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Otpis — ${item?.name ?? ''}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Odustani</button>
          <button
            className="btn btn-danger"
            onClick={handleSave}
            disabled={saving || !qty || Number(qty) <= 0}
          >
            {saving ? 'Čuvam...' : 'Otpiši'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
        <div className="form-group">
          <label>Količina ({item?.unit}) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
            autoFocus
          />
          {item && (
            <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
              Dostupno: {item.total_qty} {item.unit}
            </span>
          )}
        </div>
        <div className="form-group">
          <label>Razlog</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="npr. Pokvareno, Rasuto, Isteklo..."
          />
        </div>
      </div>
    </Modal>
  )
}
