import { adminPermissionRoles } from "./adminMockData.js";

export function AdminPermissions({ isArabic }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "الصلاحيات" : "Permissions"}</h2>
          <p>
            {isArabic
              ? "الصلاحيات حاليًا Placeholder وستربط لاحقًا مع Backend ونظام مستخدمين حقيقي."
              : "Permissions are currently a Placeholder and will later connect to Backend-backed users."}
          </p>
        </div>
        <span>Placeholder</span>
      </div>
      <div className="admin-permission-grid">
        {adminPermissionRoles.map((item) => (
          <article className="admin-permission-card" key={item.role}>
            <strong>{item.role}</strong>
            <p>{item.scope}</p>
            <b className="admin-badge placeholder">{item.status}</b>
          </article>
        ))}
      </div>
    </section>
  );
}
