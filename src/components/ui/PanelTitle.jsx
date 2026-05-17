export function PanelTitle({ title, meta }) {
  return (
    <div className="panel-title">
      <h3>{title}</h3>
      <span className="panel-meta">{meta}</span>
    </div>
  );
}
