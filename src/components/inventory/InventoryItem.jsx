import { useState } from 'react'
import { fmtQty, fmtKM, fmtDate, fmtDateShort, getItemStatus, getExpiryStatus, getDaysUntilExpiry, getExpiryDate, priceUnit, getCategoryColor } from '../../lib/utils'
import LotModal from './LotModal'
import WriteOffModal from './WriteOffModal'

function LotRow({ lot, unit, onEdit, onDelete }) {
  const isOut = lot.lot_type === 'out'

  const status = getExpiryStatus(lot.entry_date, lot.shelf_life_days)
  const days = getDaysUntilExpiry(lot.entry_date, lot.shelf_life_days)
  const expiry = getExpiryDate(lot.entry_date, lot.shelf_life_days)

  const expiryBadge = !isOut && (status === 'expired'
    ? <span className="badge badge-critical" style={{ fontSize: '.7rem' }}>ISTEKLO {fmtDateShort(expiry)}</span>
    : status === 'expiring'
    ? <span className="badge badge-low" style={{ fontSize: '.7rem' }}>Za {days}d ({fmtDateShort(expiry)})</span>
    : expiry
    ? <span className="badge badge-ok" style={{ fontSize: '.7rem' }}>Rok {fmtDate(expiry)}</span>
    : null)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.35rem 0', borderBottom: '1px solid var(--border)', opacity: isOut ? 0.85 : 1 }}>
      <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', flexShrink: 0, minWidth: 52 }}>
        {fmtDate(lot.entry_date)}
      </span>
      <span style={{ fontWeight: 600, fontSize: '.9rem', flexShrink: 0, color: isOut ? 'var(--critical)' : undefined }}>
        {isOut ? '−' : '+'}{fmtQty(lot.qty, unit)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {isOut
            ? <span style={{ fontSize: '.72rem', color: 'var(--critical)' }}>{lot.source_note ?? 'Izlaz'}</span>
            : <>
                {expiryBadge}
                {lot.supplier && <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{lot.supplier}</span>}
                {lot.price_per_unit != null && <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{fmtKM(lot.price_per_unit)}/{priceUnit(unit)}</span>}
                {lot.notes && <span style={{ fontSize: '.72rem', color: 'var(--text-dim)' }}>{lot.notes}</span>}
              </>
          }
        </div>
      </div>
      {!isOut && <>
        <button className="btn btn-ghost" style={{ padding: '.2rem .4rem', fontSize: '.8rem', flexShrink: 0 }} onClick={onEdit}>✏</button>
        <button className="btn btn-ghost" style={{ padding: '.2rem .4rem', fontSize: '.8rem', color: 'var(--critical)', flexShrink: 0 }} onClick={onDelete}>🗑</button>
      </>}
    </div>
  )
}

export default function InventoryItem({ item, onEdit, onDelete, onAddLot, onEditLot, onDeleteLot, onWriteOff }) {
  const [expanded, setExpanded] = useState(false)
  const [showAllLots, setShowAllLots] = useState(false)
  const [lotModalOpen, setLotModalOpen] = useState(false)
  const [editLot, setEditLot] = useState(null)
  const [writeOffOpen, setWriteOffOpen] = useState(false)

  const lots = item.lots ?? []
  const status = getItemStatus(item.total_qty, item.min_qty, lots)
  const categoryColor = getCategoryColor(item.category?.id)

  function openAddLot() { setEditLot(null); setLotModalOpen(true) }
  function openEditLot(lot) { setEditLot(lot); setLotModalOpen(true) }

  async function handleLotSave(data) {
    if (editLot) {
      const ok = await onEditLot(editLot.id, item.id, data)
      if (ok) setLotModalOpen(false)
    } else {
      const ok = await onAddLot(item.id, data)
      if (ok) setLotModalOpen(false)
    }
  }

  const sortedLots = [...lots].sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date))
  const visibleLots = showAllLots ? sortedLots : sortedLots.slice(-3)
  const hiddenCount = sortedLots.length - visibleLots.length

  return (
    <>
      <div className="card" style={{ padding: '.8rem 1rem', borderLeft: `3px solid ${categoryColor}` }}>
        {/* --- Header --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span className={`status-dot ${status}`} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: '.1rem' }}>
              {item.category?.name && <span>{item.category.name}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{fmtQty(item.total_qty, item.unit)}</div>
            {item.min_qty > 0 && (
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>min {fmtQty(item.min_qty, item.unit)}</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.2rem', flexShrink: 0 }}>
            <button className="btn btn-ghost" style={{ padding: '.25rem .45rem', fontSize: '.8rem' }} onClick={() => onEdit(item)}>✏</button>
            <button className="btn btn-ghost" style={{ padding: '.25rem .45rem', fontSize: '.8rem', color: 'var(--low)' }} title="Otpiši" onClick={() => setWriteOffOpen(true)}>↓</button>
            <button className="btn btn-ghost" style={{ padding: '.25rem .45rem', fontSize: '.8rem', color: 'var(--critical)' }} onClick={() => onDelete(item.id)}>🗑</button>
          </div>
        </div>

        {/* --- Lots toggle --- */}
        <button
          className="btn btn-ghost"
          style={{ marginTop: '.5rem', fontSize: '.78rem', color: 'var(--text-muted)', padding: '.2rem 0', gap: '.3rem', justifyContent: 'flex-start' }}
          onClick={() => setExpanded((x) => !x)}
        >
          {expanded ? '▲' : '▼'} {lots.length} {lots.length === 1 ? 'unos' : lots.length < 5 ? 'unosa' : 'unosa'}
          {lots.length === 0 && ' · bez unosa'}
        </button>

        {/* --- Lots list --- */}
        {expanded && (
          <div style={{ marginTop: '.4rem', borderTop: '1px solid var(--border)', paddingTop: '.4rem' }}>
            {sortedLots.length === 0 && (
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', padding: '.25rem 0' }}>Nema unosa. Dodaj prvi unos robe.</p>
            )}
            {hiddenCount > 0 && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: '.78rem', color: 'var(--text-dim)', padding: '.15rem 0', justifyContent: 'flex-start', marginBottom: '.15rem' }}
                onClick={() => setShowAllLots(true)}
              >
                + Prikaži starijih {hiddenCount}
              </button>
            )}
            {visibleLots.map((lot) => (
              <LotRow
                key={lot.id}
                lot={lot}
                unit={item.unit}
                onEdit={() => openEditLot(lot)}
                onDelete={() => onDeleteLot(lot.id, item.id)}
              />
            ))}
            {showAllLots && sortedLots.length > 3 && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: '.78rem', color: 'var(--text-dim)', padding: '.15rem 0', justifyContent: 'flex-start', marginTop: '.15rem' }}
                onClick={() => setShowAllLots(false)}
              >
                ▲ Sakrij starije unose
              </button>
            )}
            <button
              className="btn btn-ghost"
              style={{ marginTop: '.5rem', fontSize: '.82rem', color: 'var(--primary)', padding: '.25rem 0', justifyContent: 'flex-start' }}
              onClick={openAddLot}
            >
              + Dodaj unos
            </button>
          </div>
        )}
      </div>

      <LotModal
        open={lotModalOpen}
        onClose={() => { setLotModalOpen(false); setEditLot(null) }}
        onSave={handleLotSave}
        lot={editLot}
        unit={item.unit}
      />

      <WriteOffModal
        open={writeOffOpen}
        onClose={() => setWriteOffOpen(false)}
        onSave={(qty, reason) => onWriteOff(item.id, qty, reason)}
        item={item}
      />
    </>
  )
}
