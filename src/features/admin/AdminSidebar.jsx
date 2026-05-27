const SIDEBAR_NOTIFICATION_KEYS = {
  applications: "applications",
  rides: "rides",
  payments: "payments",
  support: "support"
};

export function AdminSidebar({ sections, activeSection, isArabic, onSelect, notificationCounts = {} }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <span>W</span>
        <div>
          <strong>{isArabic ? "إدارة وصل" : "Wasel Admin"}</strong>
          <small>{isArabic ? "نظام تحكم مبدئي" : "Control system"}</small>
        </div>
      </div>

      <nav className="admin-nav" aria-label={isArabic ? "أقسام لوحة الأدمن" : "Admin sections"}>
        {sections.map((section) => {
          const notificationKey = SIDEBAR_NOTIFICATION_KEYS[section.key];
          const count = notificationKey ? Number(notificationCounts[notificationKey] || 0) : 0;
          return (
            <button
              type="button"
              key={section.key}
              className={activeSection === section.key ? "active" : ""}
              onClick={() => onSelect(section)}
            >
              <span>{isArabic ? section.labelAr : section.labelEn}</span>
              {count > 0 ? <small className="admin-nav-badge" aria-label={isArabic ? `${count} تنبيه جديد` : `${count} new notifications`}>{count}</small> : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
