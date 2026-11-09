import { CalendarDays, Mail, Phone, UserRound } from 'lucide-react'
import { StatusBadge } from './StatusBadge.jsx'

export function EnquiryItem({ enquiry, compact = false }) {
  return (
    <article className={`enquiry-item ${compact ? 'compact' : ''}`}>
      <span className="enquiry-avatar"><UserRound size={18} /></span>
      <div className="enquiry-item-main">
        <div className="enquiry-item-heading"><strong>{enquiry.name || 'Resident'}</strong><StatusBadge status={enquiry.status || 'new'} /></div>
        <p className="enquiry-provider">{enquiry.providerName}</p>
        <p className="enquiry-message">{enquiry.message}</p>
        <div className="enquiry-details"><span><Phone size={13} /> {enquiry.phone}</span>{enquiry.email && <span><Mail size={13} /> {enquiry.email}</span>}<span><CalendarDays size={13} /> {new Date(enquiry.createdAt).toLocaleDateString()}</span></div>
      </div>
    </article>
  )
}
