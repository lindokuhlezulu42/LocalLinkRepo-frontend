import { ChevronRight } from 'lucide-react'
import { CATEGORIES } from '../../data/categories.js'
import { AppLink } from '../common/AppLink.jsx'
import { CategoryIcon } from '../common/CategoryIcon.jsx'
import { StatusBadge } from './StatusBadge.jsx'

export function DashboardListing({ provider, navigate, compact = false }) {
  return (
    <div className={`dashboard-listing ${compact ? 'compact' : ''}`}>
      <span className={`category-icon ${CATEGORIES.find((item) => item.name === provider.category)?.color || 'violet'}`}><CategoryIcon name={provider.category} size={19} /></span>
      <div className="dashboard-listing-copy"><strong>{provider.name}</strong><span>{provider.area} · {provider.category}</span></div>
      <StatusBadge status={provider.status} />
      <AppLink to={`/providers/${provider.id}`} navigate={navigate} className="icon-link" aria-label={`View ${provider.name}`}><ChevronRight size={18} /></AppLink>
    </div>
  )
}
