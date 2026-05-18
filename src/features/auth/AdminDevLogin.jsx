import { useState } from "react";
import { ROLES } from "../../utils/roles.js";
import { AuthField } from "./AuthField.jsx";

export function AdminDevLogin({ dispatch, isArabic }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  if (!import.meta.env.DEV) {
    return null;
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (form.username !== "admin" || form.password !== "1234") {
      setError(isArabic ? "بيانات دخول الأدمن التطويرية غير صحيحة." : "Invalid development admin credentials.");
      return;
    }

    const adminUser = {
      id: "dev_admin",
      fullName: "Development Admin",
      phone: "dev-admin",
      role: ROLES.admin,
      status: "active"
    };

    dispatch({
      type: "patch",
      patch: {
        role: ROLES.admin,
        session: { ...adminUser, name: adminUser.fullName },
        currentUser: adminUser,
        token: "dev-admin-session-token",
        authStatus: "authenticated",
        toast: isArabic ? "تم دخول الأدمن للتطوير فقط." : "Development admin signed in."
      }
    });
    window.history.replaceState(null, "", "/admin/dashboard");
  }

  return (
    <main className="welcome-auth auth-mode-login admin-dev-login" data-route="/admin/dev-login">
      <section className="auth-panel">
        <form className="auth-form auth-mode-login" onSubmit={handleSubmit}>
          <div className="auth-form-title">
            <h2>{isArabic ? "دخول أدمن للتطوير" : "Development admin login"}</h2>
            <p>{isArabic ? "مدخل مؤقت في بيئة التطوير فقط، وسيستبدل لاحقًا بنظام أدمن حقيقي." : "Temporary development-only entry, to be replaced by real admin auth later."}</p>
          </div>
          <AuthField
            label={isArabic ? "اسم المستخدم" : "Username"}
            name="adminDevUsername"
            value={form.username}
            onChange={(value) => update("username", value)}
            autoComplete="username"
          />
          <AuthField
            label={isArabic ? "كلمة السر" : "Password"}
            name="adminDevPassword"
            type="password"
            value={form.password}
            onChange={(value) => update("password", value)}
            autoComplete="current-password"
          />
          {error && <p className="auth-error">{error}</p>}
          <button className="primary auth-submit" type="submit">
            {isArabic ? "دخول لوحة الأدمن" : "Enter admin dashboard"}
          </button>
        </form>
      </section>
    </main>
  );
}
