import { ChevronRight } from '../../icons.js'
import { CATEGORIES } from '../../data/categories.js'
import { AppLink } from '../common/AppLink.jsx'
import { CategoryIcon } from '../common/CategoryIcon.jsx'
import { StatusBadge } from './StatusBadge.jsx'

export function DashboardListing({
  provider,
  navigate,
  compact = false,
  onRequestDeletion,
}) {
  return (
    <div className={`dashboard-listing ${compact ? 'compact' : ''}`}>
      <span className={`category-icon ${CATEGORIES.find((item) => item.name === provider.category)?.color || 'violet'}`}><CategoryIcon name={provider.category} size={19} /></span>
      <div className="dashboard-listing-copy"><strong>{provider.name}</strong><span>{provider.area} · {provider.category}</span></div>
      <StatusBadge status={provider.changesResubmitted ? 'changes-review' : provider.status} />
      {!compact && provider.status === 'approved' && !provider.changesResubmitted && !provider.deletionRequested && (
        <AppLink to={`/dashboard/listings/${provider.id}/edit`} navigate={navigate} className="listing-edit-link">Edit listing</AppLink>
      )}
      {!compact && provider.status === 'rejected' && (
        <AppLink to={`/dashboard/listings/${provider.id}/edit`} navigate={navigate} className="listing-edit-link">Edit listing</AppLink>
      )}
      {!compact && provider.status === 'pending' && !provider.changesResubmitted && (
        <AppLink to={`/dashboard/listings/${provider.id}/edit`} navigate={navigate} className="listing-edit-link">Edit listing</AppLink>
      )}
      {provider.status === 'approved' && (
        <AppLink to={`/providers/${provider.id}`} navigate={navigate} className="icon-link" aria-label={`View ${provider.name}`}><ChevronRight size={18} /></AppLink>
      )}
      {!compact && onRequestDeletion && (
        <button
          type="button"
          className="listing-delete-request"
          onClick={() => onRequestDeletion(provider)}
          disabled={provider.deletionRequestSubmitting}
        >
          {provider.deletionRequestSubmitting
            ? 'Saving…'
            : provider.deletionRequested
              ? 'Cancel removal request'
              : 'Request removal'}
        </button>
      )}
      {!compact && provider.changeRejectionReason && (
        <span className="change-rejection-reason">Admin feedback: {provider.changeRejectionReason}</span>
      )}
      {!compact && provider.deletionRequested && <span className="deletion-request-badge">Removal requested</span>}
    </div>
  )
}
