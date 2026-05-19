import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useEvents } from '../../hooks/useEvents'
import { useRecipes } from '../../hooks/useRecipes'
import EventCard from './EventCard'
import EventModal from './EventModal'
import EventDetailModal from './EventDetailModal'
import EventShopModal from './EventShopModal'
import FAB from '../layout/FAB'

export default function EventsTab() {
  const { events, loading, addEvent, updateEvent, deleteEvent, addDish, removeDish, cookEvent } = useEvents()
  const { recipes, cookRecipe } = useRecipes()
  const [modalOpen, setModalOpen] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [detailEvent, setDetailEvent] = useState(null)
  const [shopEvent, setShopEvent] = useState(null)

  function openAdd() { setEditEvent(null); setModalOpen(true) }
  function openEdit(event) { setEditEvent(event); setModalOpen(true) }

  async function handleSave(data) {
    if (editEvent) return updateEvent(editEvent.id, data)
    const { data: { user } } = await supabase.auth.getUser()
    return addEvent({ ...data, user_id: user?.id })
  }

  async function handleDelete(id) {
    if (!confirm('Obrisati event?')) return
    deleteEvent(id)
  }

  async function handleCookEvent(event) {
    return cookEvent(event, cookRecipe)
  }

  if (loading) return <div className="spinner" />

  const upcoming = events.filter((e) => !e.cooked && new Date(e.event_date) >= new Date(new Date().toDateString()))
  const past = events.filter((e) => e.cooked || new Date(e.event_date) < new Date(new Date().toDateString()))

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {events.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: '2.5rem' }}>📅</span>
            <p>Nema evenata. Dodaj prvi event!</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <div className="section-label">Predstojeći</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginTop: '.4rem' }}>
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} onClick={() => setDetailEvent(e)} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <div className="section-label">Prošli</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginTop: '.4rem' }}>
              {past.map((e) => (
                <EventCard key={e.id} event={e} onClick={() => setDetailEvent(e)} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
      </div>

      <FAB onClick={openAdd} />

      <EventModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} event={editEvent} />

      <EventDetailModal
        open={!!detailEvent}
        onClose={() => setDetailEvent(null)}
        event={detailEvent}
        recipes={recipes}
        onAddDish={addDish}
        onRemoveDish={removeDish}
        onCookEvent={handleCookEvent}
        onOpenShop={() => { setShopEvent(detailEvent); setDetailEvent(null) }}
      />

      <EventShopModal open={!!shopEvent} onClose={() => setShopEvent(null)} event={shopEvent} />
    </>
  )
}
