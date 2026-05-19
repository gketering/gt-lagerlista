import { useState } from 'react'
import Modal from '../shared/Modal'
import { UNITS } from '../../lib/utils'

export default function IngQtyModal({ open, onClose, item, onSave }) {
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState(item?.unit ?? 'kg')
  const [freeName, setFreeName] = useState('')

  function handleSave() {
    if (!qty) return
    onSave({
      inventory_item_id: item?.id ?? null,
      free_name: item ? null : (freeName || 'Sastojak'),
      qty_per_portion: Number(qty),
      unit,
    })
    setQty('')
    setFreeName('')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? `Količina — ${item.name}` : 'Slobodan sastojak'}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Odustani</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!qty}>Dodaj</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
        {!item && (
          <div className="form-group">
            <label>Naziv sastojka</label>
            <input value={freeName} onChange={(e) => setFreeName(e.target.value)} placeholder="npr. Maslinovo ulje" autoFocus />
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label>Količina po porciji</label>
            <input type="number" min="0" step="0.001" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" autoFocus={!!item} />
          </div>
          <div className="form-group">
            <label>Jedinica</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  )
}
