import { useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Clock3, LayoutDashboard, LogOut, MessageCircle, Plus, ShieldCheck } from 'lucide-react'
import { AppLink } from '../components/common/AppLink.jsx'
import { apiGet } from '../lib/api.js'
import { DashboardHeading } from '../components/dashboard/DashboardHeading.jsx'
import { DashboardStat } from '../components/dashboard/DashboardStat.jsx'
import { DashboardListing } from '../components/dashboard/DashboardListing.jsx'
import { EnquiryItem } from '../components/dashboard/EnquiryItem.jsx'
import { EmptyDashboard } from '../components/dashboard/EmptyDashboard.jsx'
import { ListingForm } from '../components/dashboard/ListingForm.jsx'

export function DashboardPage({ user, navigate, notify, onSignOut, refreshProviders }) {
  const [listingFilter, setListingFilter] = useState('all')
  const [myProviders, setMyProviders] = useState([])
  const [myEnquiries, setMyEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([apiGet('/api/providers/mine'), apiGet('/api/enquiries/mine')])
      .then(([listings, enquiries]) => {
        if (!active) return
        setMyProviders(listings)
        setMyEnquiries(enquiries)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [user])

  if (!user) return <main className="page-loading"><span className="spinner" /> Taking you to sign in…</main>
  const path = window.location.pathname
  const activeSection = path.endsWith('/enquiries') ? 'enquiries' : path.includes('/listings') ? 'listings' : 'overview'
  const matchingListings = listingFilter === 'all' ? myProviders : myProviders.filter((provider) => provider.status === listingFilter)

  if (loading) return <main className="page-loading"><span className="spinner" /> Loading your workspace…</main>
  if (error) return <main className="not-found"><p className="eyebrow">Dashboard unavailable</p><h1>We couldn’t load your workspace.</h1><p>{error}</p></main>

  return (
    <main className="dashboard-page">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-person">
            <span className="avatar">{user.name?.slice(0, 1).toUpperCase() || 'U'}</span>
            <div><strong>{user.name}</strong><span>{user.role === 'provider' ? 'Service provider' : 'Resident account'}</span></div>
          </div>
          <p className="sidebar-label">Workspace</p>
          <nav className="dashboard-nav" aria-label="Dashboard">
            <AppLink to="/dashboard" navigate={navigate} className={activeSection === 'overview' ? 'active' : ''}><LayoutDashboard size={17} /> Overview</AppLink>
            {user.role === 'provider' && <AppLink to="/dashboard/listings" navigate={navigate} className={activeSection === 'listings' ? 'active' : ''}><BriefcaseBusiness size={17} /> My listings</AppLink>}
            <AppLink to="/dashboard/enquiries" navigate={navigate} className={activeSection === 'enquiries' ? 'active' : ''}><MessageCircle size={17} /> Enquiries <span className="nav-count">{myEnquiries.filter((item) => item.status === 'new').length}</span></AppLink>
            {user.role === 'provider' && <AppLink to="/dashboard/listings/new" navigate={navigate}><Plus size={17} /> Add a listing</AppLink>}
            {user.role === 'admin' && <AppLink to="/admin" navigate={navigate}><ShieldCheck size={17} /> Review listings</AppLink>}
          </nav>
          <button type="button" className="dashboard-signout" onClick={onSignOut}><LogOut size={17} /> Sign out</button>
          <p className="sidebar-demo-note">Private account workspace<br />Account data is saved on the server</p>
        </aside>
        <section className="dashboard-content">
          {path.endsWith('/listings/new') || path.includes('/listings/') && path.endsWith('/edit') ? (
            <ListingForm navigate={navigate} notify={notify} onCreated={async () => {
              const listings = await apiGet('/api/providers/mine')
              setMyProviders(listings)
              await refreshProviders()
            }} />
          ) : activeSection === 'listings' ? (
            <div>
              <DashboardHeading eyebrow="Your business" title="My listings" text="Keep your service details up to date." action={<AppLink to="/dashboard/listings/new" navigate={navigate} className="button button-primary"><Plus size={16} /> Add a listing</AppLink>} />
              <div className="status-tabs">
                {['all', 'pending', 'approved', 'rejected'].map((status) => <button key={status} type="button" className={listingFilter === status ? 'active' : ''} onClick={() => setListingFilter(status)}>{status === 'all' ? 'All listings' : status[0].toUpperCase() + status.slice(1)}</button>)}
              </div>
              {matchingListings.length ? <div className="dashboard-list">{matchingListings.map((provider) => <DashboardListing key={provider.id} provider={provider} navigate={navigate} />)}</div> : <EmptyDashboard title="No listings yet" text="Add a service to let people nearby discover your work." action={<AppLink to="/dashboard/listings/new" navigate={navigate} className="button button-primary"><Plus size={16} /> Create a listing</AppLink>} />}
            </div>
          ) : activeSection === 'enquiries' ? (
            <div>
              <DashboardHeading eyebrow="Messages" title="Enquiries" text={user.role === 'provider' ? 'Messages from people looking for your services.' : 'The quote requests you have sent to local providers.'} />
              {myEnquiries.length ? <div className="enquiry-list">{myEnquiries.map((item) => <EnquiryItem key={item.id} enquiry={item} />)}</div> : <EmptyDashboard title="No enquiries yet" text={user.role === 'provider' ? 'When someone contacts you, their message will appear here.' : 'Browse services and ask a provider for a quote to see your enquiries here.'} action={user.role === 'resident' ? <AppLink to="/browse" navigate={navigate} className="button button-primary">Browse services <ArrowRight size={16} /></AppLink> : null} />}
            </div>
          ) : (
            <div>
              <DashboardHeading eyebrow="Your workspace" title={`Good ${getGreeting()}, ${user.name?.split(' ')[0] || 'there'}.`} text={user.role === 'provider' ? 'Here’s what’s happening with your services today.' : 'Find a local pro or keep track of the quotes you have requested.'} action={user.role === 'provider' ? <AppLink to="/dashboard/listings/new" navigate={navigate} className="button button-primary"><Plus size={16} /> Add a listing</AppLink> : <AppLink to="/browse" navigate={navigate} className="button button-primary">Browse services <ArrowRight size={16} /></AppLink>} />
              <div className="dashboard-stats">
                <DashboardStat icon={<BriefcaseBusiness size={19} />} label={user.role === 'provider' ? 'My listings' : 'Quote requests'} value={user.role === 'provider' ? myProviders.length : myEnquiries.length} />
                <DashboardStat icon={<Clock3 size={19} />} label="Waiting for review" value={myProviders.filter((item) => item.status === 'pending').length} />
                <DashboardStat icon={<MessageCircle size={19} />} label="New enquiries" value={myEnquiries.filter((item) => item.status === 'new').length} />
              </div>
              <div className="dashboard-lower-grid">
                <section className="dashboard-panel">
                  <div className="panel-heading"><div><p className="eyebrow">Your services</p><h2>Recent listings</h2></div><AppLink to="/dashboard/listings" navigate={navigate} className="text-link">View all <ArrowRight size={15} /></AppLink></div>
                  {myProviders.length ? myProviders.slice(0, 3).map((provider) => <DashboardListing compact key={provider.id} provider={provider} navigate={navigate} />) : <p className="panel-empty">You don’t have a service listed yet.</p>}
                </section>
                <section className="dashboard-panel">
                  <div className="panel-heading"><div><p className="eyebrow">Latest activity</p><h2>Recent enquiries</h2></div><AppLink to="/dashboard/enquiries" navigate={navigate} className="text-link">View all <ArrowRight size={15} /></AppLink></div>
                  {myEnquiries.length ? myEnquiries.slice(0, 3).map((item) => <EnquiryItem compact key={item.id} enquiry={item} />) : <p className="panel-empty">No enquiries to show just yet.</p>}
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
