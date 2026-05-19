import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { syncItemQty } from './useInventory'

export function useLog() {
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const addToast = useAppStore((s) => s.addToast)
  const invalidateInventory = useAppStore((s) => s.invalidateInventory)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [{ data: inLots, error: e1 }, { data: logs, error: e2 }, { data: writeOffs, error: e3 }] = await Promise.all([
      supabase
        .from('inventory_lots')
        .select('*, item:inventory_items(id, name, unit)')
        .eq('lot_type', 'in')
        .order('entry_date', { ascending: false })
        .limit(500),
      supabase
        .from('production_log')
        .select('*')
        .order('cooked_at', { ascending: false })
        .limit(200),
      supabase
        .from('inventory_lots')
        .select('*, item:inventory_items(id, name, unit)')
        .eq('lot_type', 'out')
        .eq('lot_subtype', 'write_off')
        .order('entry_date', { ascending: false })
        .limit(200),
    ])
    if (e1 || e2 || e3) { addToast('Greška pri učitavanju izvještaja', 'error'); setLoading(false); return }

    const map = {}
    const getDay = (date) => {
      if (!map[date]) map[date] = { date, additions: [], cookings: [], writeOffs: [] }
      return map[date]
    }

    for (const lot of inLots ?? []) getDay(lot.entry_date).additions.push(lot)
    for (const log of logs ?? []) getDay(log.cooked_at.slice(0, 10)).cookings.push(log)
    for (const lot of writeOffs ?? []) getDay(lot.entry_date).writeOffs.push(lot)

    setDays(Object.values(map).sort((a, b) => b.date.localeCompare(a.date)))
    setLoading(false)
  }, [addToast])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function deleteEntry(id) {
    const { error } = await supabase.from('production_log').delete().eq('id', id)
    if (error) { addToast('Greška pri brisanju zapisa', 'error'); return false }
    addToast('Zapis obrisan', 'success')
    await fetchAll()
    return true
  }

  async function undoCook(entry) {
    const changes = entry.inventory_changes ?? []
    const lotIds = changes.map((c) => c.out_lot_id).filter(Boolean)

    if (lotIds.length > 0) {
      const { data: deleted, error } = await supabase
        .from('inventory_lots')
        .delete()
        .in('id', lotIds)
        .select('id')
      if (error) { addToast('Greška pri vraćanju na lager', 'error'); return false }
      if (!deleted || deleted.length === 0) {
        addToast('Lotovi nisu pronađeni — možda već obrisani', 'error')
        return false
      }
      const itemIds = [...new Set(changes.map((c) => c.item_id).filter(Boolean))]
      await Promise.all(itemIds.map((id) => syncItemQty(id)))
      invalidateInventory()
    }

    const { error: logErr } = await supabase.from('production_log').delete().eq('id', entry.id)
    if (logErr) { addToast('Greška pri brisanju zapisa', 'error'); return false }

    addToast('Kuhanje poništeno, lager vraćen', 'success')
    await fetchAll()
    return true
  }

  async function deleteWriteOff(lotId, itemId) {
    const { error } = await supabase.from('inventory_lots').delete().eq('id', lotId)
    if (error) { addToast('Greška pri brisanju otpisa', 'error'); return false }
    await syncItemQty(itemId)
    invalidateInventory()
    addToast('Otpis poništen, lager vraćen', 'success')
    await fetchAll()
    return true
  }

  return { days, loading, fetchAll, deleteEntry, undoCook, deleteWriteOff }
}
