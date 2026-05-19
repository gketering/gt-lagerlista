import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    let error
    if (mode === 'login') {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }))
    } else {
      ({ error } = await supabase.auth.signUp({ email, password }))
      if (!error) setMsg('Provjeri email za potvrdu registracije.')
    }
    if (error) setMsg(error.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          🗃 Lager Lista
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="korisnik@firma.ba" />
          </div>
          <div className="form-group">
            <label>Lozinka</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {msg && <div style={{ fontSize: '.85rem', color: msg.includes('email') || msg.includes('Provjeri') ? 'var(--ok)' : 'var(--critical)', padding: '.5rem', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>{msg}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '.25rem' }}>
            {loading ? '...' : mode === 'login' ? 'Prijava' : 'Registracija'}
          </button>
        </form>
        <button className="btn btn-ghost" style={{ width: '100%', marginTop: '.75rem', fontSize: '.85rem' }}
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMsg(null) }}>
          {mode === 'login' ? 'Nemaš nalog? Registruj se' : 'Već imaš nalog? Prijavi se'}
        </button>
      </div>
    </div>
  )
}
