export function SectionHeader({ title, description, meta, actions, className = "" }) {
  return (
    <header className={`ds-section-header ${className}`.trim()}>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {(meta || actions) && (
        <div className="ds-section-actions">
          {meta && <span>{meta}</span>}
          {actions || null}
        </div>
      )}
    </header>
  );
}
