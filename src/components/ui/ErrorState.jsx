export function ErrorState({ title, description, action, className = "" }) {
  return (
    <div className={`ds-state ds-error-state ${className}`.trim()} role="alert">
      <span className="ds-state-mark" aria-hidden="true">!</span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action || null}
    </div>
  );
}
