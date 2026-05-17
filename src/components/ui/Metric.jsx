export function Metric({ label, value }) {
  return (
    <section className="metric-card">
      <small>{label}</small>
      <strong>{value}</strong>
    </section>
  );
}
