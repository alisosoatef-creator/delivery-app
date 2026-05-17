export function TopBar({ state, dispatch, t, compact }) {
  return (
    <div className="topbar">
      <div className="brand-mark">W</div>
      <div>
        <strong>{t.brand}</strong>
        {!compact && <small>{t.tagline}</small>}
      </div>
      <button className="icon-button" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>{t.language}</button>
    </div>
  );
}
