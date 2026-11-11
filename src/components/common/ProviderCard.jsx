import { ArrowRight, BadgeCheck, MapPin } from '../../icons.js'
import { CATEGORIES } from '../../data/categories.js'
import { AppLink } from './AppLink.jsx'
import { CategoryIcon } from './CategoryIcon.jsx'

export function ProviderCard({ provider, navigate }) {
  return (
    <AppLink to={`/providers/${provider.id}`} navigate={navigate} className="provider-card">
      <div className="provider-card-top">
        <span className={`category-icon ${CATEGORIES.find((item) => item.name === provider.category)?.color || 'violet'}`}>
          <CategoryIcon name={provider.category} size={22} />
        </span>
        <span className="verified-badge"><BadgeCheck size={14} /> Verified</span>
      </div>
      <h3>{provider.name}</h3>
      <p className="provider-meta"><MapPin size={15} /> {provider.area}<span>·</span>{provider.category}</p>
      <p className="provider-description">{provider.description}</p>
      <div className="provider-card-bottom">
        <span className="price-tag">{provider.price}</span>
        <span className="view-profile">View profile <ArrowRight size={15} /></span>
      </div>
    </AppLink>
  )
}
