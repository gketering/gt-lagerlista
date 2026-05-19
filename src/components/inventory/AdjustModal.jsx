import { useState } from 'react'
import Modal from '../shared/Modal'
import { fmtQty } from '../../lib/utils'

export default function AdjustModal({ open, onClose, item, onAdjust }) {
  const [delta, setDelta] = useState('')
  const [mode, setMode] = useState('add')

  if (!item) return null

  const presets = mode === 'add' ? [1, 5, 10, 25] : [-1, -5, -10, -25]

  function handleSubmit(e) {
    e.preventDefault()
    const val = Number(delta)
    if (!val) return
    onAdjust(mode === 'add' ? val : -Math.abs(val))
    setDelta('')
  }

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); setDelta('') }}
      title={`Podesi količinu — ${item.name}`}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Odustani</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!delta}>Primijeni</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 700 }}>
          {fmtQty(item.qty, item.unit)}
        </div>

        <div style={{ display: 'flex', gap: '.5rem' }}>
          {['add', 'sub'].map((m) => (
            <button
              key={m}
              className="btn"
              style={{
                flex: 1,
                background: mode === m ? 'var(--primary)' : 'var(--surface2)',
                color: mode === m ? '#fff' : 'var(--text-muted)',
              }}
              onClick={() => setMode(m)}
            >
              {m === 'add' ? '+ Dodaj' : '− Oduzmi'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
          {presets.map((p) => (
            <button key={p} className="btn btn-ghost" style={{ flex: '1 0 calc(25% - .3rem)' }}
              onClick={() => setDelta(String(Math.abs(p)))}>
              {Math.abs(p)} {item.unit}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label>Količina ({item.unit})</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="0"
            autoFocus
          />
        </div>
      </div>
    </Modal>
  )
}
