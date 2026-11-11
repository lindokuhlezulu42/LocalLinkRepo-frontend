import { useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Clock3, LayoutDashboard, LogOut, MessageCircle, Plus, ShieldCheck } from '../icons.js'
import { AppLink } from '../components/common/AppLink.jsx'
import { ConfirmationDialog } from '../components/common/ConfirmationDialog.jsx'
import { apiDelete, apiGet, apiPatch } from '../lib/api.js'
import { DashboardHeading } from '../components/dashboard/DashboardHeading.jsx'
import { DashboardStat } from '../components/dashboard/DashboardStat.jsx'
import { DashboardListing } from '../components/dashboard/DashboardListing.jsx'
import { EnquiryItem } from '../components/dashboard/EnquiryItem.jsx'
import { EmptyDashboard } from '../components/dashboard/EmptyDashboard.jsx'
import { ListingForm } from '../components/dashboard/ListingForm.jsx'

export function DashboardPage({ user, navigate, notify, onSignOut, refreshProviders }) {
  const [listingFilter, setListingFilter] = useState('all')
  const [myProviders, setMyProviders] = useState([])
  const [availableProviders, setAvailableProviders] = useState([])
  const [myEnquiries, setMyEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enquiryError, setEnquiryError] = useState('')
  const [hidingEnquiryId, setHidingEnquiryId] = useState('')
  const [listingDeletionId, setListingDeletionId] = useState('')
  const [listingActionError, setListingActionError] = useState('')
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    let active = true
    const requests = user.role === 'admin'
      ? Promise.all([apiGet('/api/admin/providers'), apiGet('/api/admin/enquiries')])
          .then(([listings, enquiries]) => [listings, enquiries, []])
      : Promise.all([
          apiGet('/api/providers/mine'),
          apiGet('/api/enquiries/mine'),
          user.role === 'resident' ? apiGet('/api/providers') : Promise.resolve([]),
        ])
    requests
      .then(([listings, enquiries, available]) => {
        if (!active) return
        setMyProviders(listings)
        setMyEnquiries(enquiries)
        setAvailableProviders(available)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [user])

  const hideEnquiry = async (id) => {
    setHidingEnquiryId(id)
    setEnquiryError('')
    try {
      await apiDelete(`/api/enquiries/${id}`)
      setMyEnquiries((current) => current.filter((enquiry) => enquiry.id !== id))
      notify('Enquiry hidden from your dashboard.')
    } catch (requestError) {
      setEnquiryError(requestError.message)
    } finally {
      setHidingEnquiryId('')
    }
  }

  const saveListingDeletionRequest = async (provider, requested) => {
    setListingDeletionId(provider.id)
    setListingActionError('')
    try {
      const updatedListing = await apiPatch(`/api/providers/${provider.id}/deletion-request`, { requested })
      setMyProviders((current) => current.map((item) => item.id === provider.id ? updatedListing : item))
      notify(requested ? 'Removal request sent to an administrator.' : 'Removal request cancelled.')
      return true
    } catch (requestError) {
      setListingActionError(requestError.message)
      return false
    } finally {
      setListingDeletionId('')
    }
  }

  const requestListingDeletion = (provider) => {
    const requested = !provider.deletionRequested
    if (!requested) {
      void saveListingDeletionRequest(provider, false)
      return
    }
    setConfirmation({
      title: 'Request listing removal?',
      message: `Ask an administrator to remove "${provider.name}"? If approved, the listing and its related enquiries will be permanently deleted.`,
      confirmLabel: 'Send removal request',
      danger: true,
      onConfirm: () => saveListingDeletionRequest(provider, true),
    })
  }

  if (!user) return <main className="page-loading"><span className="spinner" /> Taking you to sign in…</main>
  const path = window.location.pathname
  const activeSection = path.endsWith('/enquiries') ? 'enquiries' : path.includes('/listings') ? 'listings' : 'overview'
  const editMatch = path.match(/^\/dashboard\/listings\/([^/]+)\/edit$/)
  const editingListing = editMatch
    ? myProviders.find((provider) => provider.id === editMatch[1]
      && !provider.changesResubmitted
      && ['approved', 'pending', 'rejected'].includes(provider.status))
    : null
  const matchingListings = listingFilter === 'all' ? myProviders : myProviders.filter((provider) => provider.status === listingFilter)

  if (loading) return <main className="page-loading"><span className="spinner" /> Loading your workspace…</main>
  if (error) return <main className="not-found"><p className="eyebrow">Dashboard unavailable</p><h1>We couldn’t load your workspace.</h1><p>{error}</p></main>

  return (
    <main className="dashboard-page">
      {confirmation && (
        <ConfirmationDialog
          {...confirmation}
          onClose={() => setConfirmation(null)}
        />
      )}
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-person">
            <span className="avatar">{user.name?.slice(0, 1).toUpperCase() || 'U'}</span>
            <div><strong>{user.name}</strong><span>{user.role === 'provider' ? 'Service provider' : user.role === 'admin' ? 'Administrator account' : 'Resident account'}</span></div>
          </div>
          <p className="sidebar-label">Workspace</p>
          <nav className="dashboard-nav" aria-label="Dashboard">
            <AppLink to="/dashboard" navigate={navigate} className={activeSection === 'overview' ? 'active' : ''}><LayoutDashboard size={17} /> Overview</AppLink>
            {user.role === 'provider' && <AppLink to="/dashboard/listings" navigate={navigate} className={activeSection === 'listings' ? 'active' : ''}><BriefcaseBusiness size={17} /> My listings</AppLink>}
            <AppLink to={user.role === 'admin' ? '/admin' : '/dashboard/enquiries'} navigate={navigate} className={activeSection === 'enquiries' ? 'active' : ''}><MessageCircle size={17} /> {user.role === 'admin' ? 'Manage enquiries' : 'Enquiries'} <span className="nav-count">{myEnquiries.filter((item) => item.status === 'new').length}</span></AppLink>
            {user.role === 'provider' && <AppLink to="/dashboard/listings/new" navigate={navigate}><Plus size={17} /> Add a listing</AppLink>}
            {user.role === 'admin' && <AppLink to="/admin" navigate={navigate}><ShieldCheck size={17} /> Review listings</AppLink>}
          </nav>
          <button type="button" className="dashboard-signout" onClick={onSignOut}><LogOut size={17} /> Sign out</button>
          <p className="sidebar-demo-note">Private account workspace<br />Account data is saved on the server</p>
        </aside>
        <section className="dashboard-content">
          {path.endsWith('/listings/new') ? (
            <ListingForm key="new-listing" navigate={navigate} notify={notify} onCreated={async () => {
              const listings = await apiGet('/api/providers/mine')
              setMyProviders(listings)
              await refreshProviders()
            }} />
          ) : editMatch ? editingListing ? (
            <ListingForm key={editingListing.id} provider={editingListing} navigate={navigate} notify={notify} onCreated={async () => {
              const listings = await apiGet('/api/providers/mine')
              setMyProviders(listings)
              await refreshProviders()
            }} />
          ) : (
            <EmptyDashboard title="Listing cannot be edited" text="This listing is awaiting administrator review. You can edit it again after the review is complete." action={<AppLink to="/dashboard/listings" navigate={navigate} className="button button-secondary">Back to my listings</AppLink>} />
          ) : activeSection === 'listings' ? (
            <div>
              <DashboardHeading eyebrow="Your business" title="My listings" text="Keep your service details up to date." action={<AppLink to="/dashboard/listings/new" navigate={navigate} className="button button-primary"><Plus size={16} /> Add a listing</AppLink>} />
              <div className="status-tabs">
                {['all', 'pending', 'approved', 'rejected'].map((status) => <button key={status} type="button" className={listingFilter === status ? 'active' : ''} onClick={() => setListingFilter(status)}>{status === 'all' ? 'All listings' : status[0].toUpperCase() + status.slice(1)}</button>)}
              </div>
              {error && <div className="form-error" role="alert">{error}</div>}
              {listingActionError && <div className="form-error" role="alert">{listingActionError}</div>}
              {matchingListings.length ? <div className="dashboard-list">{matchingListings.map((provider) => <DashboardListing key={provider.id} provider={{ ...provider, deletionRequestSubmitting: listingDeletionId === provider.id }} navigate={navigate} onRequestDeletion={requestListingDeletion} />)}</div> : <EmptyDashboard title="No listings yet" text="Add a service to let people nearby discover your work." action={<AppLink to="/dashboard/listings/new" navigate={navigate} className="button button-primary"><Plus size={16} /> Create a listing</AppLink>} />}
            </div>
          ) : activeSection === 'enquiries' ? (
            <div>
              <DashboardHeading eyebrow="Messages" title={user.role === 'admin' ? 'All enquiries' : 'Enquiries'} text={user.role === 'provider' ? 'Messages from people looking for your services.' : user.role === 'admin' ? 'System-wide enquiries sent to LocalLink providers.' : 'The quote requests you have sent to local providers.'} />
              {enquiryError && <div className="form-error" role="alert">{enquiryError}</div>}
              {myEnquiries.length ? <div className="enquiry-list">{myEnquiries.map((item) => <EnquiryItem key={item.id} enquiry={item} onHide={user.role === 'provider' && hidingEnquiryId !== item.id ? hideEnquiry : undefined} />)}</div> : <EmptyDashboard title="No enquiries yet" text={user.role === 'provider' ? 'When someone contacts you, their message will appear here.' : 'Browse services and ask a provider for a quote to see your enquiries here.'} action={user.role === 'resident' ? <AppLink to="/browse" navigate={navigate} className="button button-primary">Browse services <ArrowRight size={16} /></AppLink> : null} />}
            </div>
          ) : user.role === 'admin' ? (
            <div>
              <DashboardHeading
                eyebrow="System overview"
                title={`Welcome, ${user.name?.split(' ')[0] || 'Administrator'}.`}
                text="Monitor provider submissions and resident enquiries across LocalLink."
              />
              <div className="dashboard-stats">
                <DashboardStat icon={<BriefcaseBusiness size={19} />} label="Total listings" value={myProviders.length} />
                <DashboardStat icon={<Clock3 size={19} />} label="Awaiting review" value={myProviders.filter((item) => item.status === 'pending').length} />
                <DashboardStat icon={<MessageCircle size={19} />} label="Total enquiries" value={myEnquiries.length} />
              </div>
              <div className="dashboard-lower-grid">
                <section className="dashboard-panel">
                  <div className="panel-heading"><div><p className="eyebrow">Moderation</p><h2>Recent provider listings</h2></div><AppLink to="/admin" navigate={navigate} className="text-link">Review listings <ArrowRight size={15} /></AppLink></div>
                  {myProviders.length
                    ? myProviders.slice(0, 3).map((provider) => <DashboardListing key={provider.id} provider={provider} navigate={navigate} />)
                    : <p className="panel-empty">No provider listings have been submitted yet.</p>}
                </section>
                <section className="dashboard-panel">
                  <div className="panel-heading"><div><p className="eyebrow">Community activity</p><h2>Recent enquiries</h2></div><AppLink to="/admin" navigate={navigate} className="text-link">View activity <ArrowRight size={15} /></AppLink></div>
                  {myEnquiries.length
                    ? myEnquiries.slice(0, 3).map((item) => <EnquiryItem compact key={item.id} enquiry={item} />)
                    : <p className="panel-empty">No enquiries have been submitted yet.</p>}
                </section>
              </div>
            </div>
          ) : (
            <div>
              <DashboardHeading eyebrow="Your workspace" title={`Good ${getGreeting()}, ${user.name?.split(' ')[0] || 'there'}.`} text={user.role === 'provider' ? 'Here’s what’s happening with your services today.' : 'Find a local pro or keep track of the quotes you have requested.'} action={user.role === 'provider' ? <AppLink to="/dashboard/listings/new" navigate={navigate} className="button button-primary"><Plus size={16} /> Add a listing</AppLink> : <AppLink to="/browse" navigate={navigate} className="button button-primary">Browse services <ArrowRight size={16} /></AppLink>} />
              <div className="dashboard-stats">
                <DashboardStat icon={<BriefcaseBusiness size={19} />} label={user.role === 'provider' ? 'My listings' : 'Available services'} value={user.role === 'provider' ? myProviders.length : availableProviders.length} />
                <DashboardStat icon={<Clock3 size={19} />} label={user.role === 'provider' ? 'Waiting for review' : 'Quote requests'} value={user.role === 'provider' ? myProviders.filter((item) => item.status === 'pending').length : myEnquiries.length} />
                <DashboardStat icon={<MessageCircle size={19} />} label={user.role === 'provider' ? 'New enquiries' : 'Recent requests'} value={myEnquiries.filter((item) => item.status === 'new').length} />
              </div>
              <div className="dashboard-lower-grid">
                <section className="dashboard-panel">
                  {user.role === 'provider' ? (
                    <>
                      <div className="panel-heading"><div><p className="eyebrow">Your services</p><h2>Recent listings</h2></div><AppLink to="/dashboard/listings" navigate={navigate} className="text-link">View all <ArrowRight size={15} /></AppLink></div>
                      {myProviders.length ? myProviders.slice(0, 3).map((provider) => <DashboardListing compact key={provider.id} provider={provider} navigate={navigate} />) : <p className="panel-empty">You don’t have a service listed yet.</p>}
                    </>
                  ) : (
                    <>
                      <div className="panel-heading"><div><p className="eyebrow">Discover nearby</p><h2>Available local services</h2></div><AppLink to="/browse" navigate={navigate} className="text-link">Browse all <ArrowRight size={15} /></AppLink></div>
                      {availableProviders.length ? availableProviders.slice(0, 3).map((provider) => <DashboardListing compact key={provider.id} provider={provider} navigate={navigate} />) : <p className="panel-empty">No approved services are available yet. Check back soon.</p>}
                    </>
                  )}
                </section>
                <section className="dashboard-panel">
                  <div className="panel-heading"><div><p className="eyebrow">Latest activity</p><h2>Recent enquiries</h2></div><AppLink to="/dashboard/enquiries" navigate={navigate} className="text-link">View all <ArrowRight size={15} /></AppLink></div>
                  {myEnquiries.length ? myEnquiries.slice(0, 3).map((item) => <EnquiryItem compact key={item.id} enquiry={item} onHide={user.role === 'provider' && hidingEnquiryId !== item.id ? hideEnquiry : undefined} />) : <p className="panel-empty">No enquiries to show just yet.</p>}
                </section>
              </div>
              <div className="dashboard-tip"><ShieldCheck size={20} /><div><strong>Keep your profile trustworthy</strong><p>Clear service descriptions and up-to-date contact details help people feel confident reaching out.</p></div></div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
}
