export function StatusBadge({ status, label }) {
  return <span className={`status-badge status-${status}`}>{label}</span>;
}
