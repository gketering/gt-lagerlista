import { useState } from 'react'
import Modal from '../shared/Modal'
import { fmtDate } from '../../lib/utils'

export default function EventDetailModal({ open, onClose, event, recipes, onAddDish, onRemoveDish, onCookEvent, onOpenShop }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [cooking, setCooking] = useState(false)

  if (!event) return null

  async function handleCook() {
    if (!confirm(`Skuhati sva jela za "${event.name}"? Ovo će oduzeti sa lagera.`)) return
    setCooking(true)
    await onCookEvent(event)
    setCooking(false)
    onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={event.name}
        footer={
          <div style={{ display: 'flex', gap: '.5rem', flex: 1, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" style={{ fontSize: '.85rem' }} onClick={onOpenShop}>🛒 Shopping</button>
            {!event.cooked && (
              <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={handleCook} disabled={cooking || (event.dishes ?? []).length === 0}>
                {cooking ? 'Kuhanje...' : '🍳 Kuhaj sve'}
              </button>
            )}
            {event.cooked && <span style={{ marginLeft: 'auto', color: 'var(--ok)', fontWeight: 600, alignSelf: 'center' }}>✓ Skuhano</span>}
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '.875rem', color: 'var(--text-muted)' }}>
            <span>📅 {fmtDate(event.event_date)}</span>
            {event.guest_count && <span>👥 {event.guest_count} gostiju</span>}
            {event.location && <span>📍 {event.location}</span>}
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: '.4rem' }}>Jela</div>
            {(event.dishes ?? []).length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>Nema jela. Dodaj recept!</p>
            )}
            {(event.dishes ?? []).map((dish) => (
              <div key={dish.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.45rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 500 }}>{dish.recipe?.name ?? '(obrisani recept)'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>{dish.portions} por.</span>
                  {!event.cooked && (
                    <button className="btn btn-ghost" style={{ padding: '.2rem .4rem', fontSize: '.8rem', color: 'var(--critical)' }} onClick={() => onRemoveDish(dish.id)}>✕</button>
                  )}
                </div>
              </div>
            ))}
            {!event.cooked && (
              <button className="btn btn-ghost" style={{ marginTop: '.5rem', fontSize: '.85rem', color: 'var(--primary)' }} onClick={() => setPickerOpen(true)}>
                + Dodaj jelo
              </button>
            )}
          </div>
        </div>
      </Modal>

      {pickerOpen && (
        <RecipePickerInline
          recipes={recipes}
          onSelect={(recipe, portions) => { onAddDish(event.id, recipe.id, portions); setPickerOpen(false) }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}

function RecipePickerInline({ recipes, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [portions, setPortions] = useState('')
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Modal open onClose={onClose} title="Dodaj jelo"
      footer={selected ? (
        <>
          <button className="btn btn-ghost" onClick={() => setSelected(null)}>Nazad</button>
          <button className="btn btn-primary" onClick={() => onSelect(selected, Number(portions))} disabled={!portions}>Dodaj</button>
        </>
      ) : null}
    >
      {!selected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pretraži..." autoFocus />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem', maxHeight: '50vh', overflowY: 'auto' }}>
            {filtered.map((r) => (
              <button key={r.id} className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '.6rem .75rem' }}
                onClick={() => { setSelected(r); setPortions(String(r.portions_default ?? 10)) }}>
                {r.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontWeight: 600 }}>{selected.name}</div>
          <div className="form-group">
            <label>Broj porcija</label>
            <input type="number" min="1" value={portions} onChange={(e) => setPortions(e.target.value)} autoFocus />
          </div>
        </div>
      )}
    </Modal>
  )
}
