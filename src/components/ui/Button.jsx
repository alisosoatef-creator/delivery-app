export function Button({ children, className = "", variant = "primary", size = "md", busy = false, type = "button", ...props }) {
  return (
    <button
      className={`ds-button ds-button-${variant} ds-button-${size} ${className}`.trim()}
      type={type}
      aria-busy={busy || undefined}
      {...props}
    >
      {children}
    </button>
  );
}
