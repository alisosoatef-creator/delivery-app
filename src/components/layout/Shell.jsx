import { Toast } from "../ui/index.js";
import { TopBar } from "./TopBar.jsx";

export function Shell({ children, state, dispatch, t, selectedDriver }) {
  const title = state.role === "driver" ? t.driver : state.role === "admin" ? t.adminPanel : t.dashboard;
  return (
    <main className="app-layout">
      <aside className="sidebar">
        <TopBar state={state} dispatch={dispatch} t={t} compact />
        <div className="nav-stack">
          <button className={state.role === "customer" ? "nav-item active" : "nav-item"} onClick={() => dispatch({ type: "patch", patch: { role: "customer" } })}>{t.customer}</button>
          <button className={state.role === "driver" ? "nav-item active" : "nav-item"} onClick={() => dispatch({ type: "patch", patch: { role: "driver" } })}>{t.driver}</button>
          <button className={state.role === "admin" ? "nav-item active" : "nav-item"} onClick={() => dispatch({ type: "patch", patch: { role: "admin" } })}>{t.admin}</button>
        </div>
        <div className="side-card">
          <span>{t.backendLive}</span>
          <strong className={state.backendLive ? "good" : "warn"}>{state.backendLive ? "Live" : "Local"}</strong>
        </div>
        <button className="secondary" onClick={() => dispatch({ type: "patch", patch: { session: null, role: "customer" } })}>{t.logout}</button>
      </aside>
      <section className="workspace">
        <header className="workspace-header">
          <div>
            <h2>{title}</h2>
            <p>{selectedDriver?.vehicle || t.tagline} · {state.liveTicks} live ticks</p>
          </div>
          <div className="header-actions">
            <select value={state.cityId} onChange={(event) => dispatch({ type: "patch", patch: { cityId: event.target.value } })}>
              {state.cities.map((city) => (
                <option key={city.id} value={city.id}>{state.language === "ar" ? city.ar : city.en}</option>
              ))}
            </select>
            <button className="icon-button" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>{t.language}</button>
          </div>
        </header>
        {children}
      </section>
      <Toast message={state.toast} />
    </main>
  );
}
