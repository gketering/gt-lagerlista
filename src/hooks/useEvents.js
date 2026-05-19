import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const addToast = useAppStore((s) => s.addToast)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*, dishes:event_dishes(*, recipe:recipes(id,name,portions_default,ingredients:recipe_ingredients(*, item:inventory_items(id,name,qty,unit))))')
      .order('event_date', { ascending: true })
    if (error) addToast('Greška pri učitavanju evenata', 'error')
    else setEvents(data ?? [])
    setLoading(false)
  }, [addToast])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function addEvent(data) {
    const { error } = await supabase.from('events').insert(data)
    if (error) { addToast('Greška pri dodavanju eventa', 'error'); return false }
    addToast('Event dodan', 'success')
    await fetchAll()
    return true
  }

  async function updateEvent(id, data) {
    const { error } = await supabase.from('events').update(data).eq('id', id)
    if (error) { addToast('Greška pri ažuriranju eventa', 'error'); return false }
    addToast('Event ažuriran', 'success')
    await fetchAll()
    return true
  }

  async function deleteEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { addToast('Greška pri brisanju eventa', 'error'); return false }
    addToast('Event obrisan', 'success')
    await fetchAll()
    return true
  }

  async function addDish(eventId, recipeId, portions) {
    const { error } = await supabase
      .from('event_dishes')
      .insert({ event_id: eventId, recipe_id: recipeId, portions })
    if (error) { addToast('Greška pri dodavanju jela', 'error'); return false }
    await fetchAll()
    return true
  }

  async function removeDish(dishId) {
    const { error } = await supabase.from('event_dishes').delete().eq('id', dishId)
    if (error) { addToast('Greška pri uklanjanju jela', 'error'); return false }
    await fetchAll()
    return true
  }

  async function cookEvent(event, cookFn) {
    for (const dish of event.dishes ?? []) {
      if (!dish.recipe) continue
      const ok = await cookFn(dish.recipe, dish.portions, event.id, event.name)
      if (!ok) return false
    }
    await supabase
      .from('events')
      .update({ cooked: true, cooked_at: new Date().toISOString() })
      .eq('id', event.id)
    addToast(`${event.name} — sva jela skuhana!`, 'success')
    await fetchAll()
    return true
  }

  return { events, loading, fetchAll, addEvent, updateEvent, deleteEvent, addDish, removeDish, cookEvent }
}
