export function Input({ label, hint, error, className = "", ...props }) {
  return (
    <label className={`ds-field ${error ? "has-error" : ""} ${className}`.trim()}>
      {label && <span>{label}</span>}
      <input aria-invalid={error ? "true" : undefined} {...props} />
      {(error || hint) && <small>{error || hint}</small>}
    </label>
  );
}
