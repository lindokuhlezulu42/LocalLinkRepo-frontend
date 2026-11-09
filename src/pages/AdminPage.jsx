import { useEffect, useState } from 'react'
import { Mail, Phone, ShieldCheck, X, Check } from 'lucide-react'
import { CATEGORIES } from '../data/categories.js'
import { CategoryIcon } from '../components/common/CategoryIcon.jsx'
import { DashboardHeading } from '../components/dashboard/DashboardHeading.jsx'
import { StatusBadge } from '../components/dashboard/StatusBadge.jsx'
import { apiGet, apiPatch } from '../lib/api.js'

export function AdminPage({ user, navigate, notify, refreshProviders }) {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate(user ? '/' : '/login')
    }
  }, [user, navigate])

  useEffect(() => {
    if (user?.role !== 'admin') return
    let active = true
    apiGet('/api/admin/providers/pending')
      .then((listings) => {
        if (active) setPending(listings)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [user])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    setError('')
    try {
      await apiPatch(`/api/admin/providers/${id}/status`, { status })
      setPending((current) => current.filter((provider) => provider.id !== id))
      await refreshProviders()
      notify(status === 'approved' ? 'Listing approved and published.' : 'Listing marked for changes.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId('')
    }
  }

  if (!user || user.role !== 'admin') return <main className="page-loading"><span className="spinner" /> Checking permissions…</main>
  if (loading) return <main className="page-loading"><span className="spinner" /> Loading listings for review…</main>

  return (
    <main className="admin-page">
      <div className="admin-wrap">
        <DashboardHeading eyebrow="Community moderation" title="Review listings" text="Check new listings before they appear in the public directory." />
        <div className="review-summary"><ShieldCheck size={20} /><span><strong>{pending.length} listing{pending.length === 1 ? '' : 's'} awaiting review</strong><small>Only administrator accounts can approve public listings.</small></span></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        {pending.length ? (
          <div className="review-list">
            {pending.map((provider) => (
              <article className="review-card" key={provider.id}>
                <div className="review-card-header"><span className={`category-icon ${CATEGORIES.find((item) => item.name === provider.category)?.color || 'violet'}`}><CategoryIcon name={provider.category} size={20} /></span><div><h2>{provider.name}</h2><p>{provider.area} · {provider.category} · Submitted by {provider.ownerName}</p></div><StatusBadge status={provider.status} /></div>
                <p>{provider.description}</p>
                <div className="review-details"><span><Phone size={15} /> {provider.phone}</span><span><Mail size={15} /> {provider.email}</span><span>{provider.price || 'Quotes on request'}</span></div>
                <div className="review-actions">
                  <button type="button" className="button button-secondary" disabled={updatingId === provider.id} onClick={() => updateStatus(provider.id, 'rejected')}><X size={16} /> Request changes</button>
                  <button type="button" className="button button-primary" disabled={updatingId === provider.id} onClick={() => updateStatus(provider.id, 'approved')}><Check size={16} /> Approve listing</button>
                </div>
              </article>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state"><span className="empty-icon"><X size={22} /></span><h2>Could not load review queue</h2><p>{error}</p></div>
        ) : (
          <div className="empty-state"><span className="empty-icon"><Check size={22} /></span><h2>You’re all caught up</h2><p>New provider listings will show up here when they’re submitted.</p></div>
        )}
      </div>
    </main>
  )
}
