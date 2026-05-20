export function StatCard({ label, value, meta, tone = "default", className = "" }) {
  return (
    <section className={`ds-stat-card ds-stat-${tone} ${className}`.trim()}>
      <span>{label}</span>
      <strong>{value}</strong>
      {meta && <small>{meta}</small>}
    </section>
  );
}
