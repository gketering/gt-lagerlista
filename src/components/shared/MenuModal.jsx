import Modal from './Modal'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'

export default function MenuModal({ open, onClose }) {
  const addToast = useAppStore((s) => s.addToast)

  async function handleExport() {
    const tables = ['categories', 'inventory_items', 'recipes', 'recipe_ingredients', 'events', 'event_dishes', 'production_log']
    const result = {}
    for (const t of tables) {
      const { data } = await supabase.from(t).select('*')
      result[t] = data ?? []
    }
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lager-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Backup exportovan', 'success')
    onClose()
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        addToast('Import nije implementiran u v1', 'info')
      } catch {
        addToast('Neispravan JSON fajl', 'error')
      }
    }
    input.click()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Meni">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '.75rem', padding: '.75rem' }} onClick={handleExport}>
          📤 Export / Backup
        </button>
        <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '.75rem', padding: '.75rem' }} onClick={handleImport}>
          📥 Import
        </button>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '.25rem 0' }} />
        <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: '.75rem', padding: '.75rem', color: 'var(--critical)' }}
          onClick={async () => { await supabase.auth.signOut(); onClose() }}>
          🚪 Odjava
        </button>
      </div>
    </Modal>
  )
}
