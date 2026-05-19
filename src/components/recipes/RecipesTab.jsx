import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useRecipes } from '../../hooks/useRecipes'
import { useInventory } from '../../hooks/useInventory'
import RecipeCard from './RecipeCard'
import RecipeModal from './RecipeModal'
import FAB from '../layout/FAB'
import SearchInput from '../shared/SearchInput'

export default function RecipesTab() {
  const { recipes, loading, saveRecipe, deleteRecipe, cookRecipe } = useRecipes()
  const { items: invItems } = useInventory()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecipe, setEditRecipe] = useState(null)

  const filtered = useMemo(() =>
    recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [recipes, search]
  )

  function openAdd() { setEditRecipe(null); setModalOpen(true) }
  function openEdit(recipe) { setEditRecipe(recipe); setModalOpen(true) }

  async function handleSave(data, ingredients) {
    if (editRecipe) return saveRecipe(data, ingredients, editRecipe.id)
    const { data: { user } } = await supabase.auth.getUser()
    return saveRecipe({ ...data, user_id: user?.id }, ingredients)
  }

  async function handleDelete(id) {
    if (!confirm('Obrisati recept?')) return
    deleteRecipe(id)
  }

  if (loading) return <div className="spinner" />

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Pretraži recepte..." />

        {filtered.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: '2.5rem' }}>🍽</span>
            <p>Nema recepata. Dodaj prvi recept!</p>
          </div>
        )}

        {filtered.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onEdit={openEdit}
            onDelete={handleDelete}
            onCook={cookRecipe}
          />
        ))}
      </div>

      <FAB onClick={openAdd} />

      <RecipeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        recipe={editRecipe}
        inventoryItems={invItems}
      />
    </>
  )
}
