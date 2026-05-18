const roles = [
  { role: "Owner", scope: "Full product control, pricing, settings, approvals, and future billing.", status: "Placeholder" },
  { role: "Admin", scope: "Operations dashboard, customers, captains, rides, and support supervision.", status: "Placeholder" },
  { role: "Operations", scope: "Ride operations, city health, captain availability, and daily workflows.", status: "Placeholder" },
  { role: "Support", scope: "Support tickets, customer contact, and issue follow-up.", status: "Placeholder" }
];

export function AdminPermissions({ isArabic }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "الصلاحيات" : "Permissions"}</h2>
          <p>
            {isArabic
              ? "الصلاحيات حاليًا Placeholder منظم، وستربط لاحقًا مع مستخدمين إداريين حقيقيين في Backend."
              : "Permissions are currently a structured Placeholder and will later connect to real Backend admin users."}
          </p>
        </div>
        <span>Placeholder</span>
      </div>
      <div className="admin-permission-grid">
        {roles.map((item) => (
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
