export function Card({ children, className = "", tone = "default", as: Component = "section", ...props }) {
  return (
    <Component className={`ds-card ds-card-${tone} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
