import { useCallback, useEffect, useRef, useState } from 'react'
import { Mail, Phone, X, Check, Search } from '../icons.js'
import { CATEGORIES } from '../data/categories.js'
import { CategoryIcon } from '../components/common/CategoryIcon.jsx'
import { DashboardHeading } from '../components/dashboard/DashboardHeading.jsx'
import { ConfirmationDialog } from '../components/common/ConfirmationDialog.jsx'
import { EnquiryItem } from '../components/dashboard/EnquiryItem.jsx'
import { StatusBadge } from '../components/dashboard/StatusBadge.jsx'
import { apiDelete, apiGet, apiPatch } from '../lib/api.js'

export function AdminPage({ user, navigate, notify, refreshProviders }) {
  const [listings, setListings] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [section, setSection] = useState('listings')
  const [listingFilter, setListingFilter] = useState('all')
  const [listingSearch, setListingSearch] = useState('')
  const [changeRejectionReasons, setChangeRejectionReasons] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [readUpdatingId, setReadUpdatingId] = useState('')
  const [deletingEnquiryId, setDeletingEnquiryId] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const adminLoadVersion = useRef(0)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate(user ? '/' : '/login')
    }
  }, [user, navigate])

  const loadAdminData = useCallback(async () => {
    const requestVersion = ++adminLoadVersion.current
    const isCurrentRequest = () => adminLoadVersion.current === requestVersion
    const errors = []
    try {
      const allListings = await apiGet('/api/admin/providers')
      if (isCurrentRequest()) setListings(allListings)
    } catch {
      const [pendingResult, approvedResult] = await Promise.allSettled([
        apiGet('/api/admin/providers/pending'),
        apiGet('/api/providers'),
      ])
      const pendingListings = pendingResult.status === 'fulfilled' ? pendingResult.value : []
      const approvedListings = approvedResult.status === 'fulfilled' ? approvedResult.value : []
      if (pendingResult.status === 'rejected') {
        errors.push(`Could not load pending listings or review actions: ${pendingResult.reason.message}`)
      }
      if (approvedResult.status === 'rejected') {
        errors.push(`Could not load approved listings: ${approvedResult.reason.message}`)
      }
      if (pendingListings.length || approvedListings.length) {
        const byId = new Map([...pendingListings, ...approvedListings].map((listing) => [listing.id, listing]))
        if (isCurrentRequest()) {
          setListings([...byId.values()].sort(
            (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
          ))
        }
        if (!errors.length) {
          errors.push('The backend does not support the full listing view yet. Showing pending and approved listings; restart the backend to include all statuses.')
        }
      } else if (!errors.length) {
        errors.push('The backend returned no listings. Confirm providers submitted to this same backend and database.')
      }
    }
    try {
      const allEnquiries = await apiGet('/api/admin/enquiries')
      if (isCurrentRequest()) setEnquiries(allEnquiries)
    } catch (requestError) {
      errors.push(`Could not load enquiries: ${requestError.message}`)
    } finally {
      if (isCurrentRequest()) {
        setError(errors.join(' '))
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (user?.role !== 'admin') return undefined
    void Promise.resolve().then(loadAdminData)
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadAdminData()
    }
    const timer = window.setInterval(refreshWhenVisible, 10000)
    window.addEventListener('focus', refreshWhenVisible)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshWhenVisible)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [user, loadAdminData])

  const updateStatus = async (provider) => {
    adminLoadVersion.current += 1
    setUpdatingId(provider.id)
    setError('')
    try {
      if (provider.changesResubmitted) {
        await apiPatch(`/api/admin/providers/${provider.id}/approve-changes`, {})
      } else {
        await apiPatch(`/api/admin/providers/${provider.id}/status`, { status: 'approved' })
      }
      await loadAdminData()
      await refreshProviders()
      notify(provider.changesResubmitted ? 'Provider changes approved and published.' : 'Listing approved and published.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId('')
    }
  }

  const rejectChanges = async (provider) => {
    const reason = changeRejectionReasons[provider.id]?.trim()
    if (!reason) {
      setError('Enter a reason before rejecting proposed changes.')
      return
    }
    adminLoadVersion.current += 1
    setUpdatingId(provider.id)
    setError('')
    try {
      await apiPatch(`/api/admin/providers/${provider.id}/reject-changes`, { reason })
      await loadAdminData()
      setChangeRejectionReasons((current) => {
        const next = { ...current }
        delete next[provider.id]
        return next
      })
      notify('Proposed changes rejected. The current published listing remains live.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId('')
    }
  }

  if (!user || user.role !== 'admin') return <main className="page-loading"><span className="spinner" /> Checking permissions…</main>
  if (loading) return <main className="page-loading"><span className="spinner" /> Loading admin dashboard…</main>

  const pendingCount = listings.filter((listing) => listing.status === 'pending').length
  const resubmittedCount = listings.filter((listing) => listing.changesResubmitted).length
  const deletionRequestCount = listings.filter((listing) => listing.deletionRequested).length
  const unreadEnquiryCount = enquiries.filter((enquiry) => !enquiry.readByAdmin).length
  const statusFilteredListings = listingFilter === 'all'
    ? listings
    : listingFilter === 'deletion_requested'
      ? listings.filter((listing) => listing.deletionRequested)
      : listingFilter === 'changes_resubmitted'
        ? listings.filter((listing) => listing.changesResubmitted)
      : listings.filter((listing) => listing.status === listingFilter)
  const searchTerm = listingSearch.trim().toLowerCase()
  const visibleListings = searchTerm
    ? statusFilteredListings.filter((listing) => [
        listing.name,
        listing.category,
        listing.area,
        listing.ownerName,
        listing.email,
        listing.description,
        listing.pendingName,
        listing.pendingCategory,
        listing.pendingArea,
        listing.pendingDescription,
        ...(listing.pendingServices || []),
        ...(listing.services || []),
      ].some((value) => value?.toLowerCase().includes(searchTerm)))
    : statusFilteredListings

  const deleteListing = async (provider) => {
    adminLoadVersion.current += 1
    setUpdatingId(provider.id)
    setError('')
    try {
      await apiDelete(`/api/admin/providers/${provider.id}`)
      adminLoadVersion.current += 1
      setListings((current) => current.filter((listing) => listing.id !== provider.id))
      setEnquiries((current) => current.filter((enquiry) => enquiry.providerId !== provider.id))
      await refreshProviders()
      notify('Listing and its related enquiries permanently deleted.')
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setUpdatingId('')
    }
  }

  const confirmDeleteListing = (provider) => setConfirmation({
    title: 'Permanently delete this listing?',
    message: `Delete "${provider.name}" and all enquiries linked to it? This action cannot be undone.`,
    confirmLabel: 'Delete listing',
    danger: true,
    onConfirm: () => deleteListing(provider),
  })

  const toggleEnquiryRead = async (enquiry) => {
    adminLoadVersion.current += 1
    setReadUpdatingId(enquiry.id)
    setError('')
    const nextReadState = !enquiry.readByAdmin
    setEnquiries((current) => current.map((item) => item.id === enquiry.id
      ? { ...item, readByAdmin: nextReadState }
      : item))
    try {
      const updatedEnquiry = await apiPatch(`/api/admin/enquiries/${enquiry.id}/read`, { read: nextReadState })
      adminLoadVersion.current += 1
      setEnquiries((current) => current.map((item) => item.id === enquiry.id ? updatedEnquiry : item))
    } catch (requestError) {
      adminLoadVersion.current += 1
      setEnquiries((current) => current.map((item) => item.id === enquiry.id
        ? { ...item, readByAdmin: enquiry.readByAdmin }
        : item))
      setError(requestError.message)
    } finally {
      setReadUpdatingId('')
    }
  }

  const deleteReadEnquiry = async (enquiry) => {
    adminLoadVersion.current += 1
    setDeletingEnquiryId(enquiry.id)
    setError('')
    try {
      await apiDelete(`/api/admin/enquiries/${enquiry.id}`)
      adminLoadVersion.current += 1
      setEnquiries((current) => current.filter((item) => item.id !== enquiry.id))
      notify('Read enquiry permanently deleted.')
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setDeletingEnquiryId('')
    }
  }

  const confirmDeleteEnquiry = (enquiry) => setConfirmation({
    title: 'Permanently delete this enquiry?',
    message: `Delete the enquiry from ${enquiry.name || 'this resident'}? This cannot be undone.`,
    confirmLabel: 'Delete enquiry',
    danger: true,
    onConfirm: () => deleteReadEnquiry(enquiry),
  })

  return (
    <main className="admin-page">
      {confirmation && (
        <ConfirmationDialog
          {...confirmation}
          onClose={() => setConfirmation(null)}
        />
      )}
      <div className="admin-wrap">
        <DashboardHeading
          eyebrow="LocalLink administration"
          title="Admin dashboard"
          text="Review every provider listing and monitor enquiries sent through LocalLink."
        />
        <div className="admin-overview-stats">
          <div><strong>{listings.length}</strong><span>Total listings</span></div>
          <div><strong>{pendingCount}</strong><span>Awaiting review</span></div>
          <div><strong>{enquiries.length}</strong><span>Total enquiries</span></div>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="admin-section-tabs" role="tablist" aria-label="Admin dashboard sections">
          <button type="button" role="tab" aria-selected={section === 'listings'} className={section === 'listings' ? 'active' : ''} onClick={() => setSection('listings')}>
            Provider listings <span>{listings.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={section === 'enquiries'} className={section === 'enquiries' ? 'active' : ''} onClick={() => setSection('enquiries')}>
            Enquiries <span>{enquiries.length}</span>
          </button>
        </div>
        {section === 'listings' ? (
          <>
            <div className="status-tabs admin-status-tabs">
              {['all', 'pending', 'changes_resubmitted', 'approved', 'rejected', 'deletion_requested'].map((status) => {
                const count = status === 'all'
                  ? listings.length
                  : status === 'deletion_requested'
                    ? deletionRequestCount
                    : status === 'changes_resubmitted'
                      ? resubmittedCount
                    : listings.filter((listing) => listing.status === status).length
                return (
                  <button key={status} type="button" className={listingFilter === status ? 'active' : ''} onClick={() => setListingFilter(status)}>
                    {status === 'all' ? 'All' : status === 'deletion_requested' ? 'Removal requests' : status === 'changes_resubmitted' ? 'Changes to approve' : status[0].toUpperCase() + status.slice(1)} ({count})
                  </button>
                )
              })}
            </div>
            <label className="admin-listing-search">
              <Search size={16} />
              <span className="sr-only">Search provider listings</span>
              <input
                type="search"
                value={listingSearch}
                onChange={(event) => setListingSearch(event.target.value)}
                placeholder="Search by provider, service, area, or owner"
              />
            </label>
            {visibleListings.length ? (
              <div className="review-list">
                {visibleListings.map((provider) => {
                  const review = provider.changesResubmitted ? {
                    ...provider,
                    name: provider.pendingName ?? provider.name,
                    category: provider.pendingCategory ?? provider.category,
                    area: provider.pendingArea ?? provider.area,
                    description: provider.pendingDescription ?? provider.description,
                    price: provider.pendingPrice ?? provider.price,
                    experience: provider.pendingExperience ?? provider.experience,
                    services: provider.pendingServices?.length ? provider.pendingServices : provider.services,
                    phone: provider.pendingPhone ?? provider.phone,
                    email: provider.pendingEmail ?? provider.email,
                  } : provider
                  return (
                  <article className="review-card" key={provider.id}>
                    <div className="review-card-header"><span className={`category-icon ${CATEGORIES.find((item) => item.name.toLowerCase() === review.category.toLowerCase())?.color || 'violet'}`}><CategoryIcon name={review.category} size={20} /></span><div><h2>{review.name}</h2><p>{review.area} · {review.category} · Submitted by {provider.ownerName}</p></div><StatusBadge status={provider.changesResubmitted ? 'changes-review' : provider.status} /></div>
                    {provider.changesResubmitted && <p className="resubmitted-notice">Proposed listing changes. The currently approved version remains public until these are approved.</p>}
                    <p>{review.description}</p>
                    <div className="review-details"><span><Phone size={15} /> {review.phone}</span><span><Mail size={15} /> {review.email}</span><span>{review.price || 'Quotes on request'}</span><span>{review.experience || 'Experience not specified'}</span><span>Services: {review.services?.join(', ') || 'Not specified'}</span><span>Submitted {new Date(provider.createdAt).toLocaleDateString()}</span></div>
                    {provider.status === 'rejected' && <p className="deletion-request-notice">The provider requested changes. They can edit and resubmit this listing.</p>}
                    {provider.deletionRequested && <p className="deletion-request-notice">The provider has requested permanent removal of this listing and its related enquiries.</p>}
                    {(provider.status === 'pending' || provider.changesResubmitted) && (
                      <div className="review-actions">
                        <button type="button" className="button button-primary" disabled={updatingId === provider.id} onClick={() => updateStatus(provider)}><Check size={16} /> {provider.changesResubmitted ? 'Approve changes' : 'Approve listing'}</button>
                        {provider.changesResubmitted && (
                          <div className="review-rejection">
                            <label className="sr-only" htmlFor={`reject-reason-${provider.id}`}>Reason for rejecting changes to {provider.name}</label>
                            <textarea
                              id={`reject-reason-${provider.id}`}
                              value={changeRejectionReasons[provider.id] || ''}
                              onChange={(event) => setChangeRejectionReasons((current) => ({ ...current, [provider.id]: event.target.value }))}
                              maxLength={500}
                              placeholder="Explain what needs to be fixed before rejecting"
                            />
                            <button type="button" className="button button-secondary" disabled={updatingId === provider.id || !changeRejectionReasons[provider.id]?.trim()} onClick={() => rejectChanges(provider)}>
                              Reject changes
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {provider.deletionRequested && (
                      <div className="review-actions">
                        <button type="button" className="button button-danger" disabled={updatingId === provider.id} onClick={() => confirmDeleteListing(provider)}>
                          <X size={16} /> {updatingId === provider.id ? 'Deleting…' : 'Approve permanent deletion'}
                        </button>
                      </div>
                    )}
                  </article>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state"><span className="empty-icon"><Check size={22} /></span><h2>{searchTerm ? 'No listings match that search' : listings.length ? 'No listings in this status' : 'No provider listings yet'}</h2><p>{searchTerm ? 'Try another provider name, service, area, or owner.' : 'New provider submissions will appear here automatically.'}</p></div>
            )}
          </>
        ) : (
          <>
            <div className="review-summary"><Mail size={20} /><span><strong>{unreadEnquiryCount} unread of {enquiries.length} enquiries</strong><small>Mark each enquiry read after review. Only administrators can access this system-wide list.</small></span></div>
            {enquiries.length ? (
              <div className="enquiry-list">
                {enquiries.map((enquiry) => <EnquiryItem
                  key={enquiry.id}
                  enquiry={enquiry}
                  onToggleRead={toggleEnquiryRead}
                  onDelete={confirmDeleteEnquiry}
                  readUpdating={readUpdatingId === enquiry.id}
                  deleteUpdating={deletingEnquiryId === enquiry.id}
                />)}
              </div>
            ) : (
              <div className="empty-state"><span className="empty-icon"><Mail size={22} /></span><h2>No enquiries yet</h2><p>Enquiries submitted to providers will appear here.</p></div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
