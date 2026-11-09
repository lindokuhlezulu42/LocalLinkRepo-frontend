export function DashboardStat({ icon, label, value }) {
  return <div className="dashboard-stat"><span className="dashboard-stat-icon">{icon}</span><div><span>{label}</span><strong>{value}</strong></div></div>
}
