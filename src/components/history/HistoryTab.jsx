import { useLog } from '../../hooks/useLog'
import { fmtDate, fmtDatetime, fmtQty, fmtKM, priceUnit } from '../../lib/utils'

export default function HistoryTab() {
  const { days, loading, deleteEntry, undoCook, deleteWriteOff } = useLog()

  if (loading) return <div className="spinner" />

  if (days.length === 0) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: '2.5rem' }}>📋</span>
        <p>Nema zabilježenih promjena.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {days.map((day) => (
        <div key={day.date}>
          <div className="section-label">{fmtDate(day.date)}</div>

          {day.additions.length > 0 && (
            <div className="card" style={{ marginTop: '.4rem', padding: '.75rem 1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--ok)', marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                ↑ Ulaz na lager
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                {day.additions.map((lot) => (
                  <div key={lot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '.5rem', fontSize: '.875rem' }}>
                    <span style={{ color: 'var(--text)' }}>{lot.item?.name ?? '—'}</span>
                    <span style={{ flexShrink: 0, textAlign: 'right' }}>
                      <span style={{ color: 'var(--ok)', fontWeight: 600 }}>
                        +{fmtQty(lot.qty, lot.item?.unit ?? '')}
                      </span>
                      {lot.supplier && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}> · {lot.supplier}</span>
                      )}
                      {lot.price_per_unit != null && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>
                          {' '}· {fmtKM(lot.price_per_unit)}/{priceUnit(lot.item?.unit ?? '')}
                        </span>
                      )}
                      {lot.notes && (
                        <span style={{ color: 'var(--text-dim)', fontSize: '.78rem' }}> · {lot.notes}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {day.writeOffs.length > 0 && (
            <div className="card" style={{ marginTop: '.4rem', padding: '.75rem 1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--low)', marginBottom: '.5rem' }}>
                ↓ Otpisi
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                {day.writeOffs.map((lot) => (
                  <div key={lot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', fontSize: '.875rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: 'var(--text)' }}>{lot.item?.name ?? '—'}</span>
                      {lot.source_note && lot.source_note !== 'Otpis' && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}> · {lot.source_note}</span>
                      )}
                    </div>
                    <span style={{ color: 'var(--low)', fontWeight: 600, flexShrink: 0 }}>
                      −{fmtQty(lot.qty, lot.item?.unit ?? '')}
                    </span>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '.75rem', padding: '.25rem .5rem', color: 'var(--ok)', flexShrink: 0 }}
                      title="Poništi otpis"
                      onClick={() => { if (confirm('Poništiti otpis i vratiti na lager?')) deleteWriteOff(lot.id, lot.item?.id) }}
                    >↩</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {day.cookings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginTop: '.4rem' }}>
              {day.cookings.map((entry) => (
                <div key={entry.id} className="card" style={{ padding: '.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--critical)' }}>↓ Izlaz</span>
                        <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{entry.recipe_name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>
                          {entry.portions} por.
                          {entry.event_name && ` · ${entry.event_name}`}
                        </span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '.75rem', marginLeft: 'auto' }}>
                          {fmtDatetime(entry.cooked_at)}
                        </span>
                      </div>
                      {(entry.inventory_changes ?? []).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.15rem', paddingLeft: '.5rem', borderLeft: '2px solid var(--border)' }}>
                          {entry.inventory_changes.map((ch, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', fontSize: '.8rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>{ch.name}</span>
                              <span style={{ color: 'var(--critical)', fontWeight: 500, flexShrink: 0 }}>
                                −{ch.unit ? fmtQty(ch.deducted, ch.unit) : ch.deducted}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.2rem', flexShrink: 0 }}>
                      {(entry.inventory_changes ?? []).length > 0 && (
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: '.75rem', padding: '.25rem .5rem', color: 'var(--low)' }}
                          onClick={() => { if (confirm('Poništiti kuhanje i vratiti lager?')) undoCook(entry) }}
                          title="Poništi"
                        >↩</button>
                      )}
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: '.75rem', padding: '.25rem .5rem', color: 'var(--critical)' }}
                        onClick={() => { if (confirm('Obrisati ovaj zapis?')) deleteEntry(entry.id) }}
                      >🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
