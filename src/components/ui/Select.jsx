export function Select({ label, hint, error, children, className = "", ...props }) {
  return (
    <label className={`ds-field ${error ? "has-error" : ""} ${className}`.trim()}>
      {label && <span>{label}</span>}
      <select aria-invalid={error ? "true" : undefined} {...props}>
        {children}
      </select>
      {(error || hint) && <small>{error || hint}</small>}
    </label>
  );
}
