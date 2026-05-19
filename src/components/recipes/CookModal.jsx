import { useState } from 'react'
import Modal from '../shared/Modal'
import { fmtQty } from '../../lib/utils'

export default function CookModal({ open, onClose, recipe, onCook }) {
  const [portions, setPortions] = useState(recipe?.portions_default ?? 10)
  const [saving, setSaving] = useState(false)

  if (!recipe) return null

  async function handleCook() {
    setSaving(true)
    const ok = await onCook(recipe, Number(portions))
    setSaving(false)
    if (ok) onClose()
  }

  const linkedIngs = (recipe.ingredients ?? []).filter((i) => i.inventory_item_id && i.item)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Kuhaj — ${recipe.name}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Odustani</button>
          <button className="btn btn-primary" onClick={handleCook} disabled={saving || !portions}>
            {saving ? 'Kuhanje...' : '🍳 Skuhaj'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Broj porcija</label>
          <input type="number" min="1" value={portions} onChange={(e) => setPortions(e.target.value)} />
        </div>

        {linkedIngs.length > 0 && (
          <div>
            <div className="section-label" style={{ marginBottom: '.4rem' }}>Oduzima sa lagera</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              {linkedIngs.map((ing) => {
                const deduct = Number(ing.qty_per_portion) * Number(portions)
                const after = Math.max(0, Number(ing.item.qty) - deduct)
                return (
                  <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', padding: '.4rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{ing.item.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {fmtQty(ing.item.qty, ing.unit)} → <strong style={{ color: after <= 0 ? 'var(--critical)' : 'var(--text)' }}>{fmtQty(after, ing.unit)}</strong>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
