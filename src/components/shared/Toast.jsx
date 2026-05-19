import { useAppStore } from '../../store/useAppStore'

const icons = { success: '✓', error: '✕', info: 'ℹ' }
const colors = {
  success: 'var(--ok)',
  error: 'var(--critical)',
  info: 'var(--primary)',
}

export default function Toast() {
  const { toasts, removeToast } = useAppStore()

  return (
    <div style={{ position: 'fixed', bottom: 'calc(var(--tab-h) + .75rem)', left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '.4rem', width: 'min(360px, calc(100vw - 2rem))' }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '.6rem',
            background: 'var(--surface2)',
            border: `1px solid ${colors[t.type] ?? colors.info}`,
            borderRadius: 'var(--radius-sm)',
            padding: '.65rem 1rem',
            boxShadow: 'var(--shadow)',
            cursor: 'pointer',
            animation: 'slideUp .2s ease',
          }}
        >
          <span style={{ color: colors[t.type] ?? colors.info, fontWeight: 700, fontSize: '.95rem' }}>
            {icons[t.type] ?? icons.info}
          </span>
          <span style={{ fontSize: '.875rem', flex: 1 }}>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}
