import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay">
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          margin: '1rem',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>{title}</span>
          <button className="btn btn-ghost" style={{ padding: '.25rem .5rem', fontSize: '1.2rem', lineHeight: 1 }} onClick={onClose}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.25rem' }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,.65);
          display: flex; align-items: center; justify-content: center;
        }
      `}</style>
    </div>
  )
}
