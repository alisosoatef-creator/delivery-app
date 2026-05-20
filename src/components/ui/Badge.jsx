export function Badge({ children, tone = "neutral", className = "" }) {
  return <span className={`ds-badge ds-badge-${tone} ${className}`.trim()}>{children}</span>;
}
