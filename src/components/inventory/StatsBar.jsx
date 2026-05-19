import { getItemStatus, getWorstExpiryFromLots } from '../../lib/utils'

export default function StatsBar({ items }) {
  const ok       = items.filter((i) => getItemStatus(i.total_qty, i.min_qty, i.lots) === 'ok').length
  const low      = items.filter((i) => getItemStatus(i.total_qty, i.min_qty, i.lots) === 'low').length
  const critical = items.filter((i) => getItemStatus(i.total_qty, i.min_qty, i.lots) === 'critical').length
  const expiring = items.filter((i) => getWorstExpiryFromLots(i.lots) === 'expiring').length
  const expired  = items.filter((i) => getWorstExpiryFromLots(i.lots) === 'expired').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.5rem' }}>
        {[
          { label: 'OK',       count: ok,       cls: 'badge-ok' },
          { label: 'Nisko',    count: low,      cls: 'badge-low' },
          { label: 'Kritično', count: critical, cls: 'badge-critical' },
          { label: 'Ukupno',   count: items.length, cls: '' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '.6rem .5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{s.count}</div>
            <div className={`badge ${s.cls}`} style={{ marginTop: '.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
      {(expired > 0 || expiring > 0) && (
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {expired > 0 && (
            <div className="card" style={{ flex: 1, padding: '.5rem .75rem', display: 'flex', gap: '.5rem', alignItems: 'center', background: 'var(--critical-bg)', border: '1px solid var(--critical)' }}>
              <span style={{ fontWeight: 700, color: 'var(--critical)' }}>{expired}</span>
              <span style={{ fontSize: '.8rem', color: 'var(--critical)' }}>Istekao rok</span>
            </div>
          )}
          {expiring > 0 && (
            <div className="card" style={{ flex: 1, padding: '.5rem .75rem', display: 'flex', gap: '.5rem', alignItems: 'center', background: 'var(--low-bg)', border: '1px solid var(--low)' }}>
              <span style={{ fontWeight: 700, color: 'var(--low)' }}>{expiring}</span>
              <span style={{ fontSize: '.8rem', color: 'var(--low)' }}>Uskoro ističe</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
