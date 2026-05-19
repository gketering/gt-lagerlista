import { useEffect, useState, Component } from 'react'
import { supabase } from './lib/supabase'
import { useAppStore } from './store/useAppStore'
import Header from './components/layout/Header'
import TabBar from './components/layout/TabBar'
import Toast from './components/shared/Toast'
import Auth from './components/Auth'
import InventoryTab from './components/inventory/InventoryTab'
import RecipesTab from './components/recipes/RecipesTab'
import HistoryTab from './components/history/HistoryTab'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#ef4444', fontFamily: 'monospace', background: '#0f1117', minHeight: '100dvh' }}>
          <h2 style={{ marginBottom: '1rem' }}>⚠ App crash</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '.85rem', background: '#1a1d27', padding: '1rem', borderRadius: 8 }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

function AppInner() {
  const [session, setSession] = useState(undefined)
  const activeTab = useAppStore((s) => s.activeTab)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div className="spinner" style={{ marginTop: '40vh' }} />
  if (!session) return <Auth />

  return (
    <>
      <Header />
      <main className="main-content">
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'recipes'   && <RecipesTab />}
        {activeTab === 'history'   && <HistoryTab />}
      </main>
      <TabBar />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}
