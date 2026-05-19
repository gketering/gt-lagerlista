import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { syncItemQty } from './useInventory'

export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const addToast = useAppStore((s) => s.addToast)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('recipes')
      .select('*, ingredients:recipe_ingredients(*, item:inventory_items(id,name,qty,unit))')
      .order('name')
    if (error) addToast('Greška pri učitavanju recepata', 'error')
    else setRecipes(data ?? [])
    setLoading(false)
  }, [addToast])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Vraća novi ID recepta ili null
  async function addRecipe(data) {
    const { data: result, error } = await supabase
      .from('recipes')
      .insert(data)
      .select('id')
      .single()
    if (error) { addToast('Greška pri dodavanju recepta', 'error'); return null }
    return result.id
  }

  async function updateRecipe(id, data) {
    const { error } = await supabase.from('recipes').update(data).eq('id', id)
    if (error) { addToast('Greška pri ažuriranju recepta', 'error'); return false }
    return true
  }

  async function deleteRecipe(id) {
    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) { addToast('Greška pri brisanju recepta', 'error'); return false }
    addToast('Recept obrisan', 'success')
    await fetchAll()
    return true
  }

  // Zamijeni sve sastojke recepta novom listom (delete + re-insert)
  async function saveIngredients(recipeId, ingredients) {
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)
    if (ingredients.length === 0) return true
    const rows = ingredients.map(({ _displayName, ...ing }) => ({ recipe_id: recipeId, ...ing }))
    const { error } = await supabase.from('recipe_ingredients').insert(rows)
    if (error) { addToast('Greška pri čuvanju normativa', 'error'); return false }
    return true
  }

  // Koristi se iz RecipesTab za create+update+ingredients u jednom pozivu
  async function saveRecipe(recipeData, ingredients, existingId = null) {
    let recipeId = existingId
    if (existingId) {
      const ok = await updateRecipe(existingId, recipeData)
      if (!ok) return false
    } else {
      recipeId = await addRecipe(recipeData)
      if (!recipeId) return false
    }
    const ok = await saveIngredients(recipeId, ingredients)
    if (!ok) return false
    addToast(existingId ? 'Recept ažuriran' : 'Recept dodan', 'success')
    await fetchAll()
    return true
  }

  async function cookRecipe(recipe, portions, eventId = null, eventName = null) {
    const changes = []
    const { data: { user } } = await supabase.auth.getUser()

    for (const ing of recipe.ingredients ?? []) {
      if (!ing.inventory_item_id || !ing.item) continue
      const deduct = Number(ing.qty_per_portion) * Number(portions)
      const note = `${recipe.name} ×${portions} por.`

      const { data: outLot, error } = await supabase
        .from('inventory_lots')
        .insert({
          inventory_item_id: ing.inventory_item_id,
          user_id: user?.id,
          qty: deduct,
          lot_type: 'out',
          source_note: note,
          entry_date: new Date().toISOString().slice(0, 10),
        })
        .select('id')
        .single()

      if (error) { addToast('Greška pri oduzimanju sa lagera', 'error'); return false }
      await syncItemQty(ing.inventory_item_id)

      changes.push({
        out_lot_id: outLot.id,
        item_id: ing.inventory_item_id,
        name: ing.item.name,
        deducted: deduct,
        unit: ing.item.unit,
      })
    }

    await supabase.from('production_log').insert({
      user_id: user?.id,
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      portions,
      event_id: eventId,
      event_name: eventName,
      inventory_changes: changes,
    })

    addToast(`${recipe.name} skuhano (${portions} por.)`, 'success')
    await fetchAll()
    return true
  }

  return { recipes, loading, fetchAll, saveRecipe, deleteRecipe, cookRecipe }
}
