export function AdminSettings({ state, updateSystemSettings, isArabic, placeholder }) {
  const settings = state.systemSettings;

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "إعدادات النظام" : "System settings"}</h2>
          <p>{isArabic ? "إعدادات محلية مؤقتة للتجربة فقط." : "Temporary local settings for the demo."}</p>
        </div>
        <span>{settings.appStatus}</span>
      </div>
      <div className="admin-settings-grid">
        <label className="field">
          <span>{isArabic ? "اسم التطبيق" : "App name"}</span>
          <input value={settings.appName} onChange={(event) => updateSystemSettings({ appName: event.target.value })} />
        </label>
        <label className="field">
          <span>{isArabic ? "حالة التطبيق" : "App status"}</span>
          <select value={settings.appStatus} onChange={(event) => updateSystemSettings({ appStatus: event.target.value })}>
            <option value="active">{isArabic ? "نشط" : "Active"}</option>
            <option value="maintenance">{isArabic ? "صيانة" : "Maintenance"}</option>
          </select>
        </label>
        <label className="field">
          <span>{isArabic ? "رقم دعم الإدارة" : "Management support number"}</span>
          <input value={settings.adminSupportPhone} onChange={(event) => updateSystemSettings({ adminSupportPhone: event.target.value })} />
        </label>
        <label className="field">
          <span>{isArabic ? "رسالة ترحيبية" : "Welcome message"}</span>
          <input value={settings.welcomeMessage} onChange={(event) => updateSystemSettings({ welcomeMessage: event.target.value })} />
        </label>
      </div>
      <button className="secondary" type="button" onClick={() => placeholder("إعدادات الإشعارات Placeholder.", "Notification settings are a Placeholder.")}>
        {isArabic ? "إعدادات إشعارات Placeholder" : "Notification settings Placeholder"}
      </button>
    </section>
  );
}
