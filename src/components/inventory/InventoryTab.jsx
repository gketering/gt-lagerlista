import { useState, useMemo } from 'react'
import { useInventory } from '../../hooks/useInventory'
import { getItemStatus, getWorstExpiryFromLots, fmtQty, fmtDate } from '../../lib/utils'
import StatsBar from './StatsBar'
import InventoryItem from './InventoryItem'
import InventoryModal from './InventoryModal'
import { supabase } from '../../lib/supabase'
import FAB from '../layout/FAB'
import SearchInput from '../shared/SearchInput'
import FilterChips from '../shared/FilterChips'
import CategoryDivider from '../shared/CategoryDivider'

const STATUS_FILTERS = [
  { value: 'all',      label: 'Sve' },
  { value: 'ok',       label: 'OK' },
  { value: 'low',      label: 'Nisko' },
  { value: 'critical', label: 'Kritično' },
  { value: 'expiring', label: 'Ističe' },
  { value: 'expired',  label: 'Isteklo' },
]

export default function InventoryTab() {
  const { items, categories, loading, addItem, updateItem, deleteItem, addLot, updateLot, deleteLot, writeOff, addCategory } = useInventory()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'Sve kategorije' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ], [categories])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter !== 'all' && (item.category?.id ?? null) !== categoryFilter) return false
      if (statusFilter === 'expiring') return getWorstExpiryFromLots(item.lots) === 'expiring'
      if (statusFilter === 'expired')  return getWorstExpiryFromLots(item.lots) === 'expired'
      if (statusFilter !== 'all' && getItemStatus(item.total_qty, item.min_qty, item.lots) !== statusFilter) return false
      return true
    })
  }, [items, search, statusFilter, categoryFilter])

  const grouped = useMemo(() => {
    const map = {}
    for (const item of filtered) {
      const key = item.category?.name ?? 'Ostalo'
      if (!map[key]) map[key] = []
      map[key].push(item)
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  function openAdd() { setEditItem(null); setModalOpen(true) }
  function openEdit(item) { setEditItem(item); setModalOpen(true) }

  async function handleSave(data) {
    if (editItem) return updateItem(editItem.id, data)
    const { data: { user } } = await supabase.auth.getUser()
    return addItem({ ...data, user_id: user?.id, qty: 0 })
  }

  async function handleDelete(id) {
    if (!confirm('Obrisati stavku i sve njene unose?')) return
    deleteItem(id)
  }

  function exportNabavka() {
    const needItems = items
      .filter((i) => ['low', 'critical'].includes(getItemStatus(i.total_qty, i.min_qty, i.lots)))
      .sort((a, b) => (a.category?.name ?? 'Ostalo').localeCompare(b.category?.name ?? 'Ostalo') || a.name.localeCompare(b.name))

    if (needItems.length === 0) { alert('Nema stavki koje trebaju nabavku.'); return }

    const byCategory = {}
    for (const item of needItems) {
      const cat = item.category?.name ?? 'Ostalo'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(item)
    }

    const rows = Object.entries(byCategory).map(([cat, catItems]) => `
      <tr class="cat-row"><td colspan="5">${cat}</td></tr>
      ${catItems.map((item) => {
        const deficit = Math.max(0, Number(item.min_qty) - Number(item.total_qty))
        const status  = getItemStatus(item.total_qty, item.min_qty, item.lots)
        return `
        <tr class="${status}">
          <td class="name">${item.name}</td>
          <td class="num">${fmtQty(item.total_qty, item.unit)}</td>
          <td class="num">${fmtQty(item.min_qty, item.unit)}</td>
          <td class="num deficit">−${fmtQty(deficit, item.unit)}</td>
          <td class="check"></td>
        </tr>`
      }).join('')}
    `).join('')

    const html = `<!DOCTYPE html><html lang="bs"><head><meta charset="utf-8">
    <title>Nabavka — ${fmtDate(new Date())}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 24px 32px; }
      h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
      .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f0f0f0; text-align: left; padding: 7px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; border-bottom: 2px solid #ccc; }
      th.num, td.num { text-align: right; }
      td { padding: 6px 10px; border-bottom: 1px solid #e8e8e8; vertical-align: middle; }
      tr.cat-row td { background: #f7f7f7; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #444; padding: 8px 10px 5px; border-top: 2px solid #ddd; border-bottom: 1px solid #ddd; }
      tr.critical .name { color: #c00; font-weight: 600; }
      tr.low .name { color: #b45309; }
      .deficit { color: #c00; font-weight: 600; }
      .check { width: 28px; border-left: 1px solid #e0e0e0; }
      .footer { margin-top: 20px; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 8px; display: flex; justify-content: space-between; }
      @media print { body { padding: 12px 20px; } }
    </style></head><body>
    <h1>Lista nabavke</h1>
    <div class="meta">Datum: ${fmtDate(new Date())} &nbsp;·&nbsp; Ukupno stavki: ${needItems.length}</div>
    <table>
      <thead><tr>
        <th style="width:40%">Namirnica</th>
        <th class="num" style="width:16%">Trenutno</th>
        <th class="num" style="width:16%">Minimum</th>
        <th class="num" style="width:16%">Nedostaje</th>
        <th class="num" style="width:12%">✓</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer"><span>Generisano automatski iz lager-liste</span><span>${fmtDate(new Date())}</span></div>
    <script>window.onload = () => { window.print() }<\/script>
    </body></html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
  }

  if (loading) return <div className="spinner" />

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        <StatsBar items={items} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" style={{ fontSize: '.8rem', color: 'var(--text-muted)', gap: '.35rem' }} onClick={exportNabavka}>
            ↓ Izvoz nabavke
          </button>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži lager..." />
        <FilterChips options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
        <FilterChips options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} />

        {grouped.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: '2.5rem' }}>📦</span>
            <p>Lager je prazan. Dodaj prvu stavku!</p>
          </div>
        )}

        {grouped.map(([cat, catItems]) => (
          <div key={cat}>
            <CategoryDivider label={cat} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {catItems.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onAddLot={addLot}
                  onEditLot={updateLot}
                  onDeleteLot={deleteLot}
                  onWriteOff={writeOff}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <FAB onClick={openAdd} />

      <InventoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onAddCategory={addCategory}
        item={editItem}
        categories={categories}
      />
    </>
  )
}
