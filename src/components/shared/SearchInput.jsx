export default function SearchInput({ value, onChange, placeholder = 'Pretraži...' }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }}>🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: '2.25rem' }}
      />
    </div>
  )
}
