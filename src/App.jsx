import { useEffect, useState } from 'react'
import { AlertCircle, Check, RefreshCw } from 'lucide-react'
import { Header } from './components/layout/Header.jsx'
import { Footer } from './components/layout/Footer.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import { AuthPage } from './pages/AuthPage.jsx'
import { BrowsePage } from './pages/BrowsePage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { apiGet, apiPost, clearCsrfToken } from './lib/api.js'
import './App.css'

function App() {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }))
  const [providers, setProviders] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [toast, setToast] = useState('')

  const loadApplicationData = async () => {
    try {
      const [directory, account] = await Promise.all([
        apiGet('/api/providers'),
        apiGet('/api/auth/me'),
      ])
      setProviders(directory)
      setUser(account)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const updateLocation = () => setLocation({
      pathname: window.location.pathname,
      search: window.location.search,
    })
    window.addEventListener('popstate', updateLocation)
    return () => window.removeEventListener('popstate', updateLocation)
  }, [])

  useEffect(() => {
    void Promise.resolve().then(loadApplicationData)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const navigate = (to) => {
    const url = new URL(to, window.location.origin)
    window.history.pushState({}, '', url)
    setLocation({ pathname: url.pathname, search: url.search })
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (url.hash) {
      window.setTimeout(() => {
        document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      }, 40)
    }
  }

  const signOut = async () => {
    try {
      await apiPost('/api/auth/logout', {})
      clearCsrfToken()
      setUser(null)
      setToast('You have been signed out.')
      navigate('/')
    } catch (error) {
      setToast(error.message)
    }
  }

  const refreshProviders = async () => {
    const directory = await apiGet('/api/providers')
    setProviders(directory)
    return directory
  }

  const path = location.pathname.replace(/\/+$/, '') || '/'
  const params = new URLSearchParams(location.search)
  const providerId = path.startsWith('/providers/') ? path.split('/')[2] : null
  const selectedProvider = providers.find((provider) => provider.id === providerId)
  let page

  if (loading) {
    page = <main className="page-loading"><span className="spinner" /> Connecting to LocalLink…</main>
  } else if (loadError) {
    page = (
      <main className="not-found">
        <span className="empty-icon"><AlertCircle size={22} /></span>
        <p className="eyebrow">Backend unavailable</p>
        <h1>We can’t connect to LocalLink.</h1>
        <p>{loadError}</p>
        <button type="button" className="button button-primary"         onClick={() => {
          setLoading(true)
          setLoadError('')
          loadApplicationData()
        }}>
          Try again <RefreshCw size={16} />
        </button>
      </main>
    )
  } else if (path === '/browse') {
    page = <BrowsePage key={location.search} params={params} navigate={navigate} />
  } else if (providerId) {
    page = selectedProvider
      ? <ProfilePage provider={selectedProvider} navigate={navigate} notify={setToast} />
      : <NotFoundPage navigate={navigate} />
  } else if (path === '/register' || path === '/login') {
    page = <AuthPage mode={path === '/register' ? 'register' : 'login'} onAuthenticated={setUser} navigate={navigate} notify={setToast} />
  } else if (path === '/forgot-password') {
    page = <ForgotPasswordPage navigate={navigate} />
  } else if (path === '/dashboard' || path.startsWith('/dashboard/')) {
    page = (
      <DashboardPage
        user={user}
        navigate={navigate}
        notify={setToast}
        onSignOut={signOut}
        refreshProviders={refreshProviders}
      />
    )
  } else if (path === '/admin') {
    page = <AdminPage user={user} navigate={navigate} notify={setToast} refreshProviders={refreshProviders} />
  } else if (path === '/') {
    page = <HomePage providers={providers} navigate={navigate} />
  } else {
    page = <NotFoundPage navigate={navigate} />
  }

  return (
    <div className="app-shell">
      <Header user={user} navigate={navigate} signOut={signOut} />
      {page}
      <Footer navigate={navigate} />
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
