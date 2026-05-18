export function AdminHeader({ state, dispatch, isArabic, activeSection }) {
  return (
    <header className="admin-header">
      <div>
        <span>{isArabic ? "صاحب التطبيق" : "App owner"}</span>
        <h1>{isArabic ? activeSection?.labelAr || "لوحة التحكم" : activeSection?.labelEn || "Admin dashboard"}</h1>
        <p>
          {isArabic
            ? "إدارة مؤقتة محلية جاهزة للربط لاحقًا مع Backend وDatabase."
            : "Local mock administration, structured for future Backend and Database wiring."}
        </p>
      </div>
      <div className="admin-header-actions">
        <strong className={state.backendLive ? "good" : "warn"}>{state.backendLive ? "Live" : "Local"}</strong>
        <button className="secondary" type="button" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>
          {isArabic ? "English" : "العربية"}
        </button>
        <button className="primary" type="button" onClick={() => dispatch({ type: "patch", patch: { session: null, role: "customer" } })}>
          {isArabic ? "خروج" : "Logout"}
        </button>
      </div>
    </header>
  );
}
