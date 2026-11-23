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
  const canEditListing = !compact && canEdit && (
    (provider.status === 'approved' && !provider.changesResubmitted)
    || provider.status === 'rejected'
    || (provider.status === 'pending' && !provider.changesResubmitted)
  )

  return (
    <div className={`dashboard-listing ${compact ? 'compact' : ''}`}>
      <div className="dashboard-listing-main">
        <span className={`category-icon ${CATEGORIES.find((item) => item.name === provider.category)?.color || 'violet'}`}><CategoryIcon name={provider.category} size={19} /></span>
        <div className="dashboard-listing-copy"><strong>{provider.name}</strong><span>{provider.area} · {provider.category}</span></div>
        <StatusBadge status={provider.changesResubmitted ? 'changes-review' : provider.status} />
      </div>
      {!compact && provider.changeRejectionReason && (
        <span className="change-rejection-reason">Admin feedback: {provider.changeRejectionReason}</span>
      )}
      {(canEditListing || (!compact && onDeleteListing)) && (
        <div className="dashboard-listing-actions">
          {canEditListing && (
            <AppLink to={`/dashboard/listings/${provider.id}/edit`} navigate={navigate} className="button button-secondary listing-action-button listing-edit-action">Edit listing</AppLink>
          )}
          {!compact && onDeleteListing && (
            <button type="button" className="button button-secondary listing-action-button listing-delete-action" onClick={() => onDeleteListing(provider)} disabled={provider.deleteSubmitting}>
              {provider.deleteSubmitting ? 'Deleting…' : 'Delete listing'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
