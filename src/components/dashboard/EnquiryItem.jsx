import { CalendarDays, Mail, Phone, UserRound, X } from '../../icons.js'
import { StatusBadge } from './StatusBadge.jsx'

export function EnquiryItem({
  enquiry,
  compact = false,
  onHide,
  onToggleRead,
  onDelete,
  readUpdating = false,
  deleteUpdating = false,
}) {
  const enquiryStatus = onToggleRead
    ? (enquiry.readByAdmin ? 'read' : 'unread')
    : (enquiry.status || 'new')

  return (
    <article className={`enquiry-item ${compact ? 'compact' : ''}`}>
      <span className="enquiry-avatar"><UserRound size={18} /></span>
      <div className="enquiry-item-main">
        <div className="enquiry-item-heading"><strong>{enquiry.name || 'Resident'}</strong><StatusBadge status={enquiryStatus} /></div>
        <p className="enquiry-provider">{enquiry.providerName}</p>
        <p className="enquiry-message">{enquiry.message}</p>
        <div className="enquiry-details"><span><Phone size={13} /> {enquiry.phone}</span>{enquiry.email && <span><Mail size={13} /> {enquiry.email}</span>}<span><CalendarDays size={13} /> {new Date(enquiry.createdAt).toLocaleDateString()}</span></div>
      </div>
      {onToggleRead && !enquiry.readByAdmin && (
        <button type="button" className="enquiry-read-button" onClick={() => onToggleRead(enquiry)} disabled={readUpdating}>
          {readUpdating ? 'Saving…' : 'Mark as read'}
        </button>
      )}
      {onDelete && enquiry.readByAdmin && (
        <button type="button" className="enquiry-read-button enquiry-delete-button" onClick={() => onDelete(enquiry)} disabled={readUpdating || deleteUpdating}>
          {deleteUpdating ? 'Deleting…' : readUpdating ? 'Saving…' : 'Delete enquiry'}
        </button>
      )}
      {onHide && <button type="button" className="enquiry-hide-button" onClick={() => onHide(enquiry.id)} aria-label={`Hide enquiry from ${enquiry.name || 'resident'}`} title="Hide from your dashboard"><X size={15} /><span>Hide</span></button>}
    </article>
  )
}
