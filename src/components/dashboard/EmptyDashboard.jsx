import { BriefcaseBusiness } from 'lucide-react'

export function EmptyDashboard({ title, text, action }) {
  return <div className="empty-state dashboard-empty"><span className="empty-icon"><BriefcaseBusiness size={21} /></span><h2>{title}</h2><p>{text}</p>{action}</div>
}
