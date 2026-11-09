export function StatusBadge({ status }) {
  const label = status === 'approved' ? 'Published' : status === 'pending' ? 'In review' : status === 'rejected' ? 'Needs changes' : 'New'
  return <span className={`status-badge status-${status}`}>{label}</span>
}
