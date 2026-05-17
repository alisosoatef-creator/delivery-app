import { Field, Toast } from "../../components/ui/index.js";
import { TopBar } from "../../components/layout/TopBar.jsx";
import { MapBoard } from "../rides/MapBoard.jsx";
import { RouteSearchCard } from "../rides/RouteSearchCard.jsx";

export function LegacyAuthScreen({ state, dispatch, t, isArabic, requestOtp, login }) {
  return (
    <main className="home-layout">
      <section className="home-hero">
        <TopBar state={state} dispatch={dispatch} t={t} />
        <div className="hero-copy">
          <h1>{isArabic ? "مشوارك جاهز قبل ما تتحرك" : "Your ride is ready before you move"}</h1>
          <p>
            {isArabic
              ? "واجهة حجز فخمة وبسيطة لاختيار نقطة الانطلاق والوجهة، رؤية السعر المتوقع، ثم الدخول وطلب المشوار بأمان."
              : "A premium first-step booking flow for choosing pickup and dropoff, previewing fare, and signing in safely."}
          </p>
        </div>
        <RouteSearchCard
          state={state}
          dispatch={dispatch}
          t={t}
          isArabic={isArabic}
          actionLabel={isArabic ? "ابدأ طلب مشوار" : "Start ride request"}
          onAction={requestOtp}
        />
      </section>

      <section className="home-map-panel">
        <MapBoard state={state} dispatch={dispatch} selectedDriver={state.drivers[0]} t={t} isArabic={isArabic} />
      </section>

      <section className="auth-card sign-in-card">
        <div className="auth-card-header">
          <span>{isArabic ? "تسجيل سريع" : "Quick sign in"}</span>
          <strong>{isArabic ? "ابدأ المرحلة الأولى" : "Start phase one"}</strong>
        </div>
        <div className="role-grid">
          {["customer", "driver"].map((role) => (
            <button
              className={`role-card ${state.role === role ? "selected" : ""}`}
              key={role}
              onClick={() => dispatch({ type: "patch", patch: { role } })}
            >
              <span className="role-icon">{role === "customer" ? "C" : "D"}</span>
              <strong>{role === "customer" ? t.customer : t.driver}</strong>
              <small>{role === "customer" ? (isArabic ? "احجز وراقب السائق" : "Book and track") : (isArabic ? "استقبل الطلبات" : "Receive requests")}</small>
            </button>
          ))}
        </div>
        <div className="form-grid">
          <Field label={t.phone} value={state.phone} onChange={(phone) => dispatch({ type: "patch", patch: { phone } })} />
          <Field label={t.otp} value={state.otp} onChange={(otp) => dispatch({ type: "patch", patch: { otp } })} />
          <label className="field">
            <span>{t.city}</span>
            <select value={state.cityId} onChange={(event) => dispatch({ type: "patch", patch: { cityId: event.target.value } })}>
              {state.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {isArabic ? city.ar : city.en}
                </option>
              ))}
            </select>
          </label>
          <div className="button-row">
            <button className="secondary" onClick={requestOtp}>{t.requestOtp}</button>
            <button className="primary" onClick={() => login(state.role)}>{t.login}</button>
          </div>
          <button className="admin-link" onClick={() => login("admin")}>{t.adminPanel}</button>
        </div>
      </section>
      <Toast message={state.toast} />
    </main>
  );
}
