export function LoadingSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`ds-skeleton ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
