import { useEffect, useState } from "react";

function normalizeSettings(settings) {
  return {
    appName: settings?.appName || "Wasel",
    appStatus: settings?.appStatus || "active",
    supportPhone: settings?.supportPhone || settings?.adminSupportPhone || "",
    welcomeMessage: settings?.welcomeMessage || ""
  };
}

export function AdminSettings({ adminSettings, updateSystemSettings, adminMutating, isArabic, placeholder }) {
  const [draft, setDraft] = useState(() => normalizeSettings(adminSettings));

  useEffect(() => {
    setDraft(normalizeSettings(adminSettings));
  }, [adminSettings]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "إعدادات النظام" : "System settings"}</h2>
          <p>{isArabic ? "إعدادات محفوظة في قاعدة البيانات المحلية للتطوير." : "Settings stored in the local development database."}</p>
        </div>
        <span>{draft.appStatus}</span>
      </div>
      <div className="admin-settings-grid">
        <label className="field">
          <span>{isArabic ? "اسم التطبيق" : "App name"}</span>
          <input value={draft.appName} onChange={(event) => updateDraft("appName", event.target.value)} />
        </label>
        <label className="field">
          <span>{isArabic ? "حالة التطبيق" : "App status"}</span>
          <select value={draft.appStatus} onChange={(event) => updateDraft("appStatus", event.target.value)}>
            <option value="active">{isArabic ? "نشط" : "Active"}</option>
            <option value="maintenance">{isArabic ? "صيانة" : "Maintenance"}</option>
          </select>
        </label>
        <label className="field">
          <span>{isArabic ? "رقم دعم الإدارة" : "Management support number"}</span>
          <input value={draft.supportPhone} onChange={(event) => updateDraft("supportPhone", event.target.value)} />
        </label>
        <label className="field">
          <span>{isArabic ? "رسالة ترحيبية" : "Welcome message"}</span>
          <input value={draft.welcomeMessage} onChange={(event) => updateDraft("welcomeMessage", event.target.value)} />
        </label>
      </div>
      <div className="admin-action-row">
        <button className="primary" type="button" onClick={() => updateSystemSettings(draft)} disabled={adminMutating}>
          {isArabic ? "حفظ الإعدادات" : "Save settings"}
        </button>
        <button className="secondary" type="button" onClick={() => placeholder("إعدادات الإشعارات Placeholder.", "Notification settings are a Placeholder.")}>
          {isArabic ? "إعدادات إشعارات Placeholder" : "Notification settings Placeholder"}
        </button>
      </div>
    </section>
  );
}
