import { useState } from 'react'
import { fmtQty } from '../../lib/utils'
import CookModal from './CookModal'

export default function RecipeCard({ recipe, onEdit, onDelete, onCook }) {
  const [expanded, setExpanded] = useState(false)
  const [cookOpen, setCookOpen] = useState(false)

  const ings = recipe.ingredients ?? []

  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{recipe.name}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '.1rem', display: 'flex', gap: '.4rem' }}>
              {recipe.category && <span>{recipe.category}</span>}
              <span>· {recipe.portions_default} por.</span>
              <span>· {ings.length} sast.</span>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ fontSize: '.85rem', padding: '.3rem .55rem' }} title="Kuhaj" onClick={() => setCookOpen(true)}>🍳</button>
          <button className="btn btn-ghost" style={{ fontSize: '.85rem', padding: '.3rem .55rem' }} title="Uredi" onClick={() => onEdit(recipe)}>✏</button>
          <button className="btn btn-ghost" style={{ fontSize: '.85rem', padding: '.3rem .55rem', color: 'var(--critical)' }} title="Obriši" onClick={() => onDelete(recipe.id)}>🗑</button>
          {ings.length > 0 && (
            <button className="btn btn-ghost" style={{ fontSize: '.85rem', padding: '.3rem .45rem' }} onClick={() => setExpanded((x) => !x)}>
              {expanded ? '▲' : '▼'}
            </button>
          )}
        </div>

        {expanded && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '.5rem' }}>
            <div className="section-label" style={{ marginBottom: '.3rem' }}>Normativ / porcija</div>
            {ings.map((ing) => (
              <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '.3rem 0', borderBottom: '1px solid var(--border)', fontSize: '.875rem' }}>
                <span>{ing.item?.name ?? ing.free_name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{fmtQty(ing.qty_per_portion, ing.unit)}</span>
              </div>
            ))}
            <button
              className="btn btn-ghost"
              style={{ marginTop: '.4rem', fontSize: '.82rem', color: 'var(--primary)', padding: '.2rem 0' }}
              onClick={() => onEdit(recipe)}
            >
              ✏ Uredi normativ
            </button>
          </div>
        )}
      </div>

      <CookModal open={cookOpen} onClose={() => setCookOpen(false)} recipe={recipe} onCook={onCook} />
    </>
  )
}
