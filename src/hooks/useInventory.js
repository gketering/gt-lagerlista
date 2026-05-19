import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

const DEFAULT_CATEGORIES = ['Voće', 'Povrće', 'Meso', 'Zamrzivač', 'Frižider']

// Standalone export — koristi ga i useRecipes za kuhanje
export async function syncItemQty(itemId) {
  const { data: lots } = await supabase
    .from('inventory_lots')
    .select('qty, lot_type')
    .eq('inventory_item_id', itemId)
  const total = (lots ?? []).reduce((s, l) => s + (l.lot_type === 'out' ? -Number(l.qty) : Number(l.qty)), 0)
  await supabase.from('inventory_items').update({ qty: Math.max(0, total) }).eq('id', itemId)
}

function enrichItems(items) {
  return (items ?? []).map((item) => {
    const lots = item.lots ?? []
    const total_qty = lots.length > 0
      ? Math.max(0, lots.reduce((s, l) => s + (l.lot_type === 'out' ? -Number(l.qty) : Number(l.qty)), 0))
      : Number(item.qty ?? 0)
    return { ...item, total_qty, lots }
  })
}

export function useInventory() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const addToast = useAppStore((s) => s.addToast)
  const inventoryVersion = useAppStore((s) => s.inventoryVersion)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: inv, error: e1 }, { data: cats, error: e2 }] = await Promise.all([
      supabase
        .from('inventory_items')
        .select('*, category:categories(id,name), lots:inventory_lots(*)')
        .order('name'),
      supabase.from('categories').select('*').order('name'),
    ])
    if (e1 || e2) { addToast('Greška pri učitavanju lagera', 'error'); setLoading(false); return }

    if ((cats ?? []).length === 0) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('categories').insert(
          DEFAULT_CATEGORIES.map((name) => ({ name, user_id: user.id }))
        )
        const { data: freshCats } = await supabase.from('categories').select('*').order('name')
        setItems(enrichItems(inv))
        setCategories(freshCats ?? [])
        setLoading(false)
        return
      }
    }

    setItems(enrichItems(inv))
    setCategories(cats ?? [])
    setLoading(false)
  }, [addToast])

  useEffect(() => { fetchAll() }, [fetchAll, inventoryVersion])

  async function addItem(data) {
    const { error } = await supabase.from('inventory_items').insert(data)
    if (error) { addToast('Greška pri dodavanju stavke', 'error'); return false }
    addToast('Stavka dodana', 'success')
    await fetchAll()
    return true
  }

  async function updateItem(id, data) {
    const { error } = await supabase.from('inventory_items').update(data).eq('id', id)
    if (error) { addToast('Greška pri ažuriranju', 'error'); return false }
    addToast('Stavka ažurirana', 'success')
    await fetchAll()
    return true
  }

  async function deleteItem(id) {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id)
    if (error) { addToast('Greška pri brisanju', 'error'); return false }
    addToast('Stavka obrisana', 'success')
    await fetchAll()
    return true
  }

  async function addLot(itemId, data) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('inventory_lots').insert({
      inventory_item_id: itemId,
      user_id: user.id,
      ...data,
    })
    if (error) { addToast('Greška pri dodavanju unosa', 'error'); return false }
    await syncItemQty(itemId)
    await fetchAll()
    return true
  }

  async function updateLot(lotId, itemId, data) {
    const { error } = await supabase.from('inventory_lots').update(data).eq('id', lotId)
    if (error) { addToast('Greška pri ažuriranju unosa', 'error'); return false }
    await syncItemQty(itemId)
    await fetchAll()
    return true
  }

  async function deleteLot(lotId, itemId) {
    const { error } = await supabase.from('inventory_lots').delete().eq('id', lotId)
    if (error) { addToast('Greška pri brisanju unosa', 'error'); return false }
    await syncItemQty(itemId)
    addToast('Unos obrisan', 'success')
    await fetchAll()
    return true
  }

  async function writeOff(itemId, qty, reason) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('inventory_lots').insert({
      inventory_item_id: itemId,
      user_id: user.id,
      qty,
      lot_type: 'out',
      lot_subtype: 'write_off',
      source_note: reason,
      entry_date: new Date().toISOString().slice(0, 10),
    })
    if (error) { addToast('Greška pri otpisu', 'error'); return false }
    await syncItemQty(itemId)
    addToast('Otpis evidentiran', 'success')
    await fetchAll()
    return true
  }

  async function addCategory(name) {
    const trimmed = name.trim()
    if (!trimmed) return false
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('categories').insert({ name: trimmed, user_id: user.id })
    if (error) { addToast('Greška pri dodavanju kategorije', 'error'); return null }
    const { data: freshCats } = await supabase.from('categories').select('*').order('name')
    setCategories(freshCats ?? [])
    const newCat = (freshCats ?? []).find((c) => c.name === trimmed)
    return newCat ?? null
  }

  return {
    items, categories, loading, fetchAll,
    addItem, updateItem, deleteItem,
    addLot, updateLot, deleteLot,
    writeOff,
    addCategory,
  }
}
