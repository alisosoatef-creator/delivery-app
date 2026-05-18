export function AdminSidebar({ sections, activeSection, isArabic, onSelect }) {
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
        {sections.map((section) => (
          <button
            type="button"
            key={section.key}
            className={activeSection === section.key ? "active" : ""}
            onClick={() => onSelect(section)}
          >
            <span>{isArabic ? section.labelAr : section.labelEn}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
