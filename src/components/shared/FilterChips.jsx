export default function FilterChips({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '.4rem', overflowX: 'auto', paddingBottom: '.25rem' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flexShrink: 0,
            padding: '.3rem .8rem',
            borderRadius: 99,
            fontSize: '.8rem', fontWeight: 500,
            background: value === opt.value ? 'var(--primary)' : 'var(--surface2)',
            color: value === opt.value ? '#fff' : 'var(--text-muted)',
            border: '1px solid',
            borderColor: value === opt.value ? 'var(--primary)' : 'var(--border)',
            transition: 'all .15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
