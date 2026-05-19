import Modal from '../shared/Modal'
import { fmtQty, fmtKM } from '../../lib/utils'

export default function EventShopModal({ open, onClose, event }) {
  if (!event) return null

  const shopMap = {}
  for (const dish of event.dishes ?? []) {
    for (const ing of dish.recipe?.ingredients ?? []) {
      const key = ing.inventory_item_id ?? ing.free_name
      const total = Number(ing.qty_per_portion) * Number(dish.portions)
      if (shopMap[key]) {
        shopMap[key].total += total
      } else {
        shopMap[key] = {
          name: ing.item?.name ?? ing.free_name,
          unit: ing.unit,
          total,
          price: ing.item?.price_per_unit ?? null,
          have: ing.item?.qty ?? 0,
        }
      }
    }
  }

  const shopList = Object.values(shopMap).map((s) => ({
    ...s,
    needed: Math.max(0, s.total - Number(s.have)),
    cost: s.price != null ? s.price * Math.max(0, s.total - Number(s.have)) : null,
  }))

  const totalCost = shopList.reduce((acc, s) => acc + (s.cost ?? 0), 0)

  return (
    <Modal open={open} onClose={onClose} title={`Shopping lista — ${event.name}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
        {shopList.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nema jela za ovaj event.</p>}
        {shopList.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                Ukupno: {fmtQty(s.total, s.unit)} · Na lageru: {fmtQty(s.have, s.unit)}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 600, color: s.needed > 0 ? 'var(--critical)' : 'var(--ok)' }}>
                {s.needed > 0 ? `Kupiti: ${fmtQty(s.needed, s.unit)}` : '✓ Dovoljno'}
              </div>
              {s.cost != null && s.needed > 0 && <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{fmtKM(s.cost)}</div>}
            </div>
          </div>
        ))}
        {totalCost > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '.5rem' }}>
            <span>Procijenjeni trošak</span>
            <span>{fmtKM(totalCost)}</span>
          </div>
        )}
      </div>
    </Modal>
  )
}
