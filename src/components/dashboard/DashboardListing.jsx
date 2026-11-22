import { CATEGORIES } from '../../data/categories.js'
import { AppLink } from '../common/AppLink.jsx'
import { CategoryIcon } from '../common/CategoryIcon.jsx'
import { StatusBadge } from './StatusBadge.jsx'

export function DashboardListing({
  provider,
  navigate,
  compact = false,
  canEdit = false,
  onDeleteListing,
}) {
  return (
    <div className={`dashboard-listing ${compact ? 'compact' : ''}`}>
      <span className={`category-icon ${CATEGORIES.find((item) => item.name === provider.category)?.color || 'violet'}`}><CategoryIcon name={provider.category} size={19} /></span>
      <div className="dashboard-listing-copy"><strong>{provider.name}</strong><span>{provider.area} · {provider.category}</span></div>
      <StatusBadge status={provider.changesResubmitted ? 'changes-review' : provider.status} />
      {!compact && canEdit && provider.status === 'approved' && !provider.changesResubmitted && (
        <AppLink to={`/dashboard/listings/${provider.id}/edit`} navigate={navigate} className="listing-edit-link">Edit listing</AppLink>
      )}
      {!compact && canEdit && provider.status === 'rejected' && (
        <AppLink to={`/dashboard/listings/${provider.id}/edit`} navigate={navigate} className="listing-edit-link">Edit listing</AppLink>
      )}
      {!compact && canEdit && provider.status === 'pending' && !provider.changesResubmitted && (
        <AppLink to={`/dashboard/listings/${provider.id}/edit`} navigate={navigate} className="listing-edit-link">Edit listing</AppLink>
      )}
      {!compact && onDeleteListing && (
        <button
          type="button"
          className="listing-delete-button"
          onClick={() => onDeleteListing(provider)}
          disabled={provider.deleteSubmitting}
        >
          {provider.deleteSubmitting
            ? 'Deleting…'
            : 'Delete listing'}
        </button>
      )}
      {!compact && provider.changeRejectionReason && (
        <span className="change-rejection-reason">Admin feedback: {provider.changeRejectionReason}</span>
      )}
    </div>
  )
}
