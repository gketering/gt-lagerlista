import { useState, useEffect } from 'react'
import Modal from '../shared/Modal'
import { fmtDate, getExpiryDate, priceUnit } from '../../lib/utils'

const today = () => new Date().toISOString().slice(0, 10)

export default function LotModal({ open, onClose, onSave, lot, unit }) {
  const [qty, setQty] = useState('')
  const [entryDate, setEntryDate] = useState(today())
  const [shelfDays, setShelfDays] = useState('')
  const [supplier, setSupplier] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (lot) {
      setQty(lot.qty ?? '')
      setEntryDate(lot.entry_date ?? today())
      setShelfDays(lot.shelf_life_days ?? '')
      setSupplier(lot.supplier ?? '')
      setPrice(lot.price_per_unit ?? '')
      setNotes(lot.notes ?? '')
    } else {
      setQty('')
      setEntryDate(today())
      setShelfDays('')
      setSupplier('')
      setPrice('')
      setNotes('')
    }
  }, [lot, open])

  const expiryPreview = entryDate && shelfDays ? getExpiryDate(entryDate, shelfDays) : null

  async function handleSave() {
    if (!qty || !entryDate) return
    setSaving(true)
    await onSave({
      qty: Number(qty),
      entry_date: entryDate,
      shelf_life_days: shelfDays !== '' ? Number(shelfDays) : null,
      supplier: supplier || null,
      price_per_unit: price !== '' ? Number(price) : null,
      notes: notes || null,
    })
    setSaving(false)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lot ? 'Uredi unos' : 'Novi unos robe'}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Odustani</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !qty || !entryDate}>
            {saving ? 'Čuvam...' : 'Sačuvaj'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
        <div className="form-row">
          <div className="form-group">
            <label>Datum ulaza *</label>
            <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label>Količina ({unit}) *</label>
            <input type="number" min="0" step="0.01" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Dobavljač</label>
            <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="npr. Pemo" />
          </div>
          <div className="form-group">
            <label>Cijena / {priceUnit(unit)} (KM)</label>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Rok trajanja (dani)</label>
            <input type="number" min="1" value={shelfDays} onChange={(e) => setShelfDays(e.target.value)} placeholder="npr. 7" />
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            {expiryPreview && (
              <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '.45rem .75rem', marginTop: '1.4rem' }}>
                Ističe: <strong style={{ color: 'var(--text)' }}>{fmtDate(expiryPreview)}</strong>
              </div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Napomena</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="npr. Lot A..." />
        </div>
      </div>
    </Modal>
  )
}
