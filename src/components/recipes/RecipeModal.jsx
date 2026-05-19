import { useState, useEffect } from 'react'
import Modal from '../shared/Modal'
import { fmtQty, UNITS } from '../../lib/utils'
import IngredientPicker from './IngredientPicker'
import IngQtyModal from './IngQtyModal'

const EMPTY_FORM = { name: '', category: '', portions_default: 10, notes: '' }

export default function RecipeModal({ open, onClose, onSave, recipe, inventoryItems = [] }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [ingredients, setIngredients] = useState([])
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [qtyItem, setQtyItem] = useState(undefined) // undefined = closed, null = slobodan unos, obj = item

  useEffect(() => {
    if (!open) return
    if (recipe) {
      setForm({
        name: recipe.name ?? '',
        category: recipe.category ?? '',
        portions_default: recipe.portions_default ?? 10,
        notes: recipe.notes ?? '',
      })
      setIngredients(
        (recipe.ingredients ?? []).map((ing) => ({
          inventory_item_id: ing.inventory_item_id ?? null,
          free_name: ing.free_name ?? null,
          qty_per_portion: ing.qty_per_portion,
          unit: ing.unit,
          _displayName: ing.item?.name ?? ing.free_name ?? '?',
        }))
      )
    } else {
      setForm(EMPTY_FORM)
      setIngredients([])
    }
  }, [open, recipe])

  function setF(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function handlePickerSelect(item) {
    setPickerOpen(false)
    setQtyItem(item ?? null) // null = slobodan unos
  }

  function handleQtySave({ inventory_item_id, free_name, qty_per_portion, unit }) {
    const _displayName = inventory_item_id
      ? (inventoryItems.find((i) => i.id === inventory_item_id)?.name ?? free_name ?? '?')
      : (free_name ?? 'Slobodan sastojak')
    setIngredients((prev) => [...prev, { inventory_item_id, free_name, qty_per_portion, unit, _displayName }])
    setQtyItem(undefined)
  }

  function removeIngredient(idx) {
    setIngredients((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    if (!form.name.trim()) return
    setSaving(true)
    const ok = await onSave(
      { name: form.name.trim(), category: form.category || null, portions_default: Number(form.portions_default) || 10, notes: form.notes || null },
      ingredients
    )
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={recipe ? 'Uredi recept' : 'Novi recept'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={onClose}>Odustani</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !form.name.trim()}>
              {saving ? 'Čuvam...' : 'Sačuvaj'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          {/* Osnovni podaci */}
          <div className="form-group">
            <label>Naziv jela *</label>
            <input value={form.name} onChange={(e) => setF('name', e.target.value)} placeholder="npr. Pileći paprikaš" autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Kategorija</label>
              <input value={form.category} onChange={(e) => setF('category', e.target.value)} placeholder="npr. Topla jela" />
            </div>
            <div className="form-group">
              <label>Def. porcija</label>
              <input type="number" min="1" value={form.portions_default} onChange={(e) => setF('portions_default', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Napomena</label>
            <textarea value={form.notes} onChange={(e) => setF('notes', e.target.value)} rows={2} placeholder="..." />
          </div>

          {/* Normativ */}
          <div>
            <div className="section-label" style={{ marginBottom: '.4rem' }}>Normativ (po porciji)</div>

            {ingredients.length === 0 && (
              <p style={{ fontSize: '.83rem', color: 'var(--text-muted)', padding: '.25rem 0' }}>Nema dodanih sastojaka.</p>
            )}

            {ingredients.map((ing, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.35rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ flex: 1, fontSize: '.875rem' }}>{ing._displayName}</span>
                <span style={{ fontSize: '.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>{fmtQty(ing.qty_per_portion, ing.unit)}</span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '.2rem .4rem', fontSize: '.8rem', color: 'var(--critical)', flexShrink: 0 }}
                  onClick={() => removeIngredient(idx)}
                >✕</button>
              </div>
            ))}

            <button
              className="btn btn-ghost"
              style={{ marginTop: '.5rem', fontSize: '.83rem', color: 'var(--primary)', padding: '.25rem 0', justifyContent: 'flex-start' }}
              onClick={() => setPickerOpen(true)}
            >
              + Dodaj sastojak
            </button>
          </div>
        </div>
      </Modal>

      <IngredientPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        items={inventoryItems}
        onSelect={handlePickerSelect}
      />

      {qtyItem !== undefined && (
        <IngQtyModal
          open
          onClose={() => setQtyItem(undefined)}
          item={qtyItem}
          onSave={handleQtySave}
        />
      )}
    </>
  )
}
