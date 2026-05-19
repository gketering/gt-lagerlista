import { fmtDate } from '../../lib/utils'

export default function EventCard({ event, onClick, onEdit, onDelete }) {
  const isPast = new Date(event.event_date) < new Date(new Date().toDateString())

  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer', opacity: isPast && event.cooked ? .65 : 1 }}
      onClick={onClick}
    >
      <div style={{ flexShrink: 0, textAlign: 'center', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '.4rem .6rem', minWidth: 48 }}>
        <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {new Date(event.event_date).toLocaleString('bs', { month: 'short' })}
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1 }}>
          {new Date(event.event_date).getDate()}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.name}</div>
        <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', display: 'flex', gap: '.5rem', marginTop: '.1rem', flexWrap: 'wrap' }}>
          {event.guest_count && <span>👥 {event.guest_count}</span>}
          {event.location && <span>📍 {event.location}</span>}
          <span>🍽 {(event.dishes ?? []).length} jela</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.25rem', flexShrink: 0 }}>
        {event.cooked
          ? <span className="badge badge-ok">Skuhano</span>
          : isPast
            ? <span className="badge badge-critical">Prošlo</span>
            : <span className="badge badge-low">Predstojeći</span>
        }
        <div style={{ display: 'flex', gap: '.2rem' }}>
          <button className="btn btn-ghost" style={{ padding: '.25rem .4rem', fontSize: '.8rem' }} onClick={(e) => { e.stopPropagation(); onEdit(event) }}>✏</button>
          <button className="btn btn-ghost" style={{ padding: '.25rem .4rem', fontSize: '.8rem', color: 'var(--critical)' }} onClick={(e) => { e.stopPropagation(); onDelete(event.id) }}>🗑</button>
        </div>
      </div>
    </div>
  )
}
