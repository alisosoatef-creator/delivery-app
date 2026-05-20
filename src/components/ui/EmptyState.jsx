export function EmptyState({ title, description, action, className = "" }) {
  return (
    <div className={`ds-state ds-empty-state ${className}`.trim()}>
      <span className="ds-state-mark" aria-hidden="true">W</span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action || null}
    </div>
  );
}
