export function StatusBadge({ status }) {
  const label = status === 'approved'
    ? 'Published'
    : status === 'pending'
      ? 'In review'
      : status === 'rejected'
        ? 'Changes requested'
        : status === 'read'
          ? 'Read'
          : status === 'unread'
            ? 'Unread'
              : status === 'changes-review'
                ? 'Changes in review'
                : 'New'
  return <span className={`status-badge status-${status}`}>{label}</span>
}
