export default function FAB({ onClick, label = '+' }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--tab-h) + .75rem)',
        right: '1rem',
        zIndex: 60,
        width: 52, height: 52,
        borderRadius: '50%',
        background: 'var(--primary)',
        color: '#fff',
        fontSize: '1.6rem',
        lineHeight: 1,
        boxShadow: '0 4px 16px rgba(79,126,255,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform .15s',
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(.93)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
    >
      {label}
    </button>
  )
}
