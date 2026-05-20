export function ModalDrawer({ open, title, children, onClose, className = "" }) {
  if (!open) return null;
  return (
    <div className="ds-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section className={`ds-drawer ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <strong>{title}</strong>
          <button className="secondary" type="button" onClick={onClose} aria-label="Close">×</button>
        </header>
        {children}
      </section>
    </div>
  );
}
