import { useState } from "react";
import { SettingsIcon, Toast } from "../../components/ui/index.js";
import { APP_ROUTE_PATHS, routePathForCustomerView } from "../../routes/index.js";
import { AccountSettingsPanel } from "./AccountSettingsPanel.jsx";
import { CustomerPanel } from "./CustomerPanel.jsx";

export function CustomerShell(props) {
  const { state, dispatch, t, isArabic, logout } = props;
  const [activeView, setActiveView] = useState("ride");
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const customerName = state.session?.name || (isArabic ? "عميل واصل" : "Wasel rider");
  const navItems = [
    { key: "ride", label: isArabic ? "طلب مشوار" : "Request ride" },
    { key: "trips", label: isArabic ? "رحلاتي" : "My trips" },
    { key: "wallet", label: isArabic ? "المحفظة/الدفع" : "Wallet/payment" },
    { key: "support", label: isArabic ? "الدعم" : "Support" },
    { key: "account", label: isArabic ? "حسابي" : "Account" }
  ];

  const activeRoutePath = settingsPanelOpen ? APP_ROUTE_PATHS.customer.settings : routePathForCustomerView(activeView);
  const routedNavItems = navItems.map((item) => ({
    ...item,
    path: routePathForCustomerView(item.key)
  }));

  return (
    <main className="customer-app-layout" data-route={activeRoutePath}>
      <header className="customer-navbar">
        <div className="customer-brand">
          <span className="brand-mark">W</span>
          <div>
            <strong>{t.brand}</strong>
            <small>{customerName}</small>
          </div>
        </div>

        <nav className="customer-nav" aria-label={isArabic ? "تنقل الزبون" : "Customer navigation"}>
          {routedNavItems.map((item) => (
            <button
              type="button"
              key={item.key}
              data-route={item.path}
              className={activeView === item.key ? "active" : ""}
              onClick={() => setActiveView(item.key)}
              aria-current={activeView === item.key ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="customer-actions">
          <button
            type="button"
            className={settingsPanelOpen ? "customer-settings-button active" : "customer-settings-button"}
            onClick={() => setSettingsPanelOpen(true)}
            aria-label={isArabic ? "الإعدادات" : "Settings"}
          >
            <SettingsIcon />
          </button>
          <button className="secondary customer-logout" onClick={() => (logout ? logout() : dispatch({ type: "patch", patch: { session: null, role: "customer" } }))}>
            {t.logout}
          </button>
        </div>
      </header>

      <section className="customer-main">
        <CustomerPanel {...props} activeView={activeView} setActiveView={setActiveView} />
      </section>

      <nav className="customer-bottom-nav" aria-label={isArabic ? "تنقل الزبون السريع" : "Customer quick navigation"}>
        {routedNavItems.map((item) => (
          <button
            type="button"
            key={item.key}
            data-route={item.path}
            className={activeView === item.key ? "active" : ""}
            onClick={() => setActiveView(item.key)}
            aria-current={activeView === item.key ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {settingsPanelOpen && (
        <div
          className="settings-panel-backdrop account-settings-drawer-host"
          role="dialog"
          aria-modal="true"
          aria-label={isArabic ? "إعدادات الحساب" : "Account settings"}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSettingsPanelOpen(false);
          }}
        >
          <AccountSettingsPanel
            state={state}
            dispatch={dispatch}
            t={t}
            isArabic={isArabic}
            onClose={() => setSettingsPanelOpen(false)}
          />
        </div>
      )}
      <Toast message={state.toast} />
    </main>
  );
}
