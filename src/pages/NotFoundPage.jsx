import { ArrowRight, Search } from 'lucide-react'
import { AppLink } from '../components/common/AppLink.jsx'

export function NotFoundPage({ navigate }) {
  return <main className="not-found"><span className="empty-icon"><Search size={22} /></span><p className="eyebrow">Not found</p><h1>We can’t find that service.</h1><p>It may have been removed or the address might be incorrect.</p><AppLink to="/browse" navigate={navigate} className="button button-primary">Back to services <ArrowRight size={17} /></AppLink></main>
}
