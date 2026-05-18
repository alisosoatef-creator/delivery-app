import { homePathForRole } from "../../utils/roles.js";

export function AccessDenied({ state, isArabic, onNavigateHome }) {
  const homePath = homePathForRole(state);
  const title = isArabic ? "لا تملك صلاحية الوصول لهذه الصفحة" : "You do not have permission to access this page";
  const description = isArabic
    ? "هذه الواجهة محمية حسب دور الحساب الحالي."
    : "This area is protected by the current account role.";

  return (
    <main className="access-denied-panel" data-route={homePath}>
      <section>
        <span>{isArabic ? "صلاحيات" : "Permissions"}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <button className="primary" type="button" onClick={onNavigateHome}>
          {isArabic ? "العودة للصفحة المناسبة" : "Back to the right page"}
        </button>
      </section>
    </main>
  );
}
