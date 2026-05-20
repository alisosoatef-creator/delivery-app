import { Badge, Card, SectionHeader } from "../../components/ui/index.js";

const roles = [
  {
    role: "Owner",
    scope: "Full product control, settings, pricing, captain approvals, and future billing governance.",
    scopeAr: "تحكم كامل بالتطبيق والإعدادات والأسعار وموافقات الكباتن وحوكمة الدفع لاحقًا.",
    tone: "success"
  },
  {
    role: "Admin",
    scope: "Daily management for customers, captains, rides, payments overview, and system configuration.",
    scopeAr: "إدارة يومية للزبائن والكباتن والرحلات وملخص المدفوعات وإعدادات النظام.",
    tone: "info"
  },
  {
    role: "Support",
    scope: "Support tickets, customer contact, captain issues, and follow-up notes.",
    scopeAr: "تذاكر الدعم والتواصل مع الزبائن ومشاكل الكباتن وملاحظات المتابعة.",
    tone: "warning"
  }
];

export function AdminPermissions({ isArabic }) {
  return (
    <section className="admin-panel admin-permissions-premium">
      <SectionHeader
        title={isArabic ? "الصلاحيات" : "Permissions"}
        description={
          isArabic
            ? "الصلاحيات المعروضة الآن محصورة في Owner وAdmin وSupport فقط، وسترتبط لاحقًا بمستخدمين إداريين حقيقيين في Backend."
            : "Visible admin permissions are now limited to Owner, Admin, and Support only. They will later connect to real Backend admin users."
        }
        meta={isArabic ? "Placeholder منظم" : "Structured placeholder"}
      />
      <div className="admin-permission-grid">
        {roles.map((item) => (
          <Card className="admin-permission-card permission-premium-card" key={item.role} as="article">
            <div>
              <strong>{item.role}</strong>
              <Badge tone={item.tone}>{isArabic ? "قيد الربط" : "Placeholder"}</Badge>
            </div>
            <p>{isArabic ? item.scopeAr : item.scope}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
