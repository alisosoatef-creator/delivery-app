import { useEffect, useMemo, useState } from "react";
import { Badge, Button, DataTable, EmptyState, Input, SectionHeader, Select } from "../../components/ui/index.js";
import { ADMIN_TEAM_ROLES, formatDate, statusLabel, textFor } from "./adminFormatters.js";

const SETTINGS_TABS = ["general", "pricing", "payments", "support", "security", "team"];

function normalizeSettings(settings) {
  return {
    appName: settings?.appName || "Wasel",
    appStatus: settings?.appStatus || "active",
    supportPhone: settings?.supportPhone || settings?.adminSupportPhone || "",
    welcomeMessage: settings?.welcomeMessage || ""
  };
}

function buildPricingDrafts(pricingRules) {
  return Object.fromEntries(
    pricingRules.map((rule) => [
      rule.cityId,
      {
        baseFareIls: rule.baseFareIls ?? rule.baseFare ?? 0,
        perKmIls: rule.perKmIls ?? rule.pricePerKm ?? 0,
        minimumFareIls: rule.minimumFareIls ?? rule.minimumFare ?? 0,
        isActive: rule.isActive !== false
      }
    ])
  );
}

function tabLabel(tab, isArabic) {
  return {
    general: textFor(isArabic, "عام", "General"),
    pricing: textFor(isArabic, "الأسعار", "Pricing"),
    payments: textFor(isArabic, "الدفع", "Payments"),
    support: textFor(isArabic, "الدعم", "Support"),
    security: textFor(isArabic, "الأمان", "Security"),
    team: textFor(isArabic, "الفريق", "Team")
  }[tab];
}

export function AdminSettings({ state, adminSettings, updateSystemSettings, updatePricingRule, adminMutating, isArabic, placeholder, pricingRules = [], cityName }) {
  const [activeTab, setActiveTab] = useState("general");
  const [draft, setDraft] = useState(() => normalizeSettings(adminSettings));
  const [pricingDrafts, setPricingDrafts] = useState(() => buildPricingDrafts(pricingRules));
  const pricingKey = useMemo(() => pricingRules.map((rule) => `${rule.cityId}:${rule.updatedAt}:${rule.isActive}`).join("|"), [pricingRules]);

  useEffect(() => {
    setDraft(normalizeSettings(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    setPricingDrafts(buildPricingDrafts(pricingRules));
  }, [pricingKey, pricingRules]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updatePricingDraft(cityId, field, value) {
    setPricingDrafts((current) => ({
      ...current,
      [cityId]: {
        ...current[cityId],
        [field]: field === "isActive" ? value : Number(value)
      }
    }));
  }

  const teamRows = [
    { id: "owner", name: "Product Owner", role: "owner", status: "active", lastActivity: "Placeholder" },
    { id: "admin", name: "Admin Manager", role: "admin", status: "active", lastActivity: "Placeholder" },
    { id: "support", name: "Support Desk", role: "support", status: "active", lastActivity: "Placeholder" }
  ];

  return (
    <section className="admin-panel admin-advanced-section admin-settings-advanced">
      <SectionHeader
        title={textFor(isArabic, "إعدادات النظام", "System settings")}
        description={textFor(isArabic, "تبويبات إعدادات إدارية منظمة بدون تغيير منطق التطبيق أو إضافة خدمات خارجية.", "Organized admin settings tabs without changing app logic or adding external services.")}
        meta={draft.appStatus}
      />

      <div className="admin-settings-tabs" role="tablist" aria-label={textFor(isArabic, "تبويبات الإعدادات", "Settings tabs")}>
        {SETTINGS_TABS.map((tab) => (
          <button className={activeTab === tab ? "is-active" : ""} type="button" key={tab} onClick={() => setActiveTab(tab)}>
            {tabLabel(tab, isArabic)}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="admin-settings-tab-panel">
          <div className="admin-settings-grid">
            <Input label={textFor(isArabic, "اسم التطبيق", "App name")} value={draft.appName} onChange={(event) => updateDraft("appName", event.target.value)} />
            <Select label={textFor(isArabic, "حالة التطبيق", "App status")} value={draft.appStatus} onChange={(event) => updateDraft("appStatus", event.target.value)}>
              <option value="active">{textFor(isArabic, "نشط", "Active")}</option>
              <option value="maintenance">{textFor(isArabic, "صيانة", "Maintenance")}</option>
            </Select>
            <Input label={textFor(isArabic, "رقم دعم الإدارة", "Management support number")} value={draft.supportPhone} onChange={(event) => updateDraft("supportPhone", event.target.value)} />
            <Input label={textFor(isArabic, "رسالة ترحيبية", "Welcome message")} value={draft.welcomeMessage} onChange={(event) => updateDraft("welcomeMessage", event.target.value)} />
          </div>
          <div className="admin-action-row">
            <Button variant="primary" onClick={() => updateSystemSettings(draft)} disabled={adminMutating}>
              {textFor(isArabic, "حفظ الإعدادات", "Save settings")}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "pricing" && (
        <div className="admin-settings-tab-panel">
          <DataTable
            className="pricing-table advanced-admin-table"
            gridTemplateColumns="minmax(130px, 1fr) repeat(3, minmax(110px, .8fr)) minmax(105px, .8fr) minmax(95px, .7fr)"
            columns={[
              { key: "city", label: textFor(isArabic, "المدينة", "City") },
              { key: "base", label: textFor(isArabic, "سعر البداية", "Base fare") },
              { key: "km", label: textFor(isArabic, "سعر الكيلومتر", "Per km") },
              { key: "minimum", label: textFor(isArabic, "الحد الأدنى", "Minimum") },
              { key: "status", label: textFor(isArabic, "الحالة", "Status") },
              { key: "save", label: textFor(isArabic, "حفظ", "Save") }
            ]}
            rows={pricingRules}
            empty={<EmptyState title={textFor(isArabic, "لا توجد قواعد أسعار", "No pricing rules")} description={textFor(isArabic, "ستظهر المدن والأسعار بعد seed أو ربط قاعدة البيانات.", "Cities and pricing appear after seed or database connection.")} />}
            renderRow={(rule) => {
              const draftRule = pricingDrafts[rule.cityId] || buildPricingDrafts([rule])[rule.cityId];
              return (
                <div className="admin-table-row" key={rule.id || rule.cityId}>
                  <strong>{cityName?.(state, rule.cityId, isArabic) || rule.cityName}</strong>
                  <input type="number" min="0" value={draftRule.baseFareIls} onChange={(event) => updatePricingDraft(rule.cityId, "baseFareIls", event.target.value)} />
                  <input type="number" min="0" value={draftRule.perKmIls} onChange={(event) => updatePricingDraft(rule.cityId, "perKmIls", event.target.value)} />
                  <input type="number" min="0" value={draftRule.minimumFareIls} onChange={(event) => updatePricingDraft(rule.cityId, "minimumFareIls", event.target.value)} />
                  <select value={draftRule.isActive ? "active" : "inactive"} onChange={(event) => updatePricingDraft(rule.cityId, "isActive", event.target.value === "active")}>
                    <option value="active">{statusLabel("active", isArabic)}</option>
                    <option value="inactive">{statusLabel("inactive", isArabic)}</option>
                  </select>
                  <Button variant="secondary" size="sm" onClick={() => updatePricingRule(rule.cityId, draftRule)} disabled={adminMutating}>
                    {textFor(isArabic, "حفظ", "Save")}
                  </Button>
                </div>
              );
            }}
          />
        </div>
      )}

      {activeTab === "payments" && (
        <div className="admin-settings-tab-panel admin-settings-note-grid">
          <article>
            <Badge tone="success">{textFor(isArabic, "كاش", "Cash")}</Badge>
            <h3>{textFor(isArabic, "الدفع النقدي مفعل محليًا", "Cash is locally enabled")}</h3>
            <p>{textFor(isArabic, "يتم ربطه بالرحلات وسجل المدفوعات بدون بوابة دفع.", "It is linked to rides and payment records without a payment gateway.")}</p>
          </article>
          <article>
            <Badge tone="warning">VISA Placeholder</Badge>
            <h3>{textFor(isArabic, "الدفع الإلكتروني تجريبي", "Electronic payment is a placeholder")}</h3>
            <p>{textFor(isArabic, "لا يتم حفظ CVV أو رقم البطاقة الكامل، وسيتم ربط بوابة دفع لاحقًا.", "CVV and full card numbers are not stored. A payment gateway will be connected later.")}</p>
          </article>
        </div>
      )}

      {activeTab === "support" && (
        <div className="admin-settings-tab-panel admin-settings-note-grid">
          {["مشكلة في الرحلة", "مشكلة في الدفع", "مشكلة في الحساب", "مشكلة في GPS", "أخرى"].map((type) => (
            <article key={type}>
              <Badge tone="info">{textFor(isArabic, "نوع دعم", "Support type")}</Badge>
              <h3>{isArabic ? type : type}</h3>
              <p>{textFor(isArabic, "Placeholder لإدارة أنواع مشاكل الدعم من Backend لاحقًا.", "Placeholder for managing support issue types from the Backend later.")}</p>
            </article>
          ))}
          <article>
            <Badge tone="success">{textFor(isArabic, "رقم الدعم", "Support phone")}</Badge>
            <h3>{draft.supportPhone || "-"}</h3>
            <p>{textFor(isArabic, "يُستخدم كرقم تواصل إداري داخل الواجهة.", "Used as the management contact number in the UI.")}</p>
          </article>
        </div>
      )}

      {activeTab === "security" && (
        <div className="admin-settings-tab-panel admin-settings-note-grid">
          <article>
            <Badge tone="warning">Dev login</Badge>
            <h3>{textFor(isArabic, "دخول الأدمن التطويري مؤقت", "Admin dev login is temporary")}</h3>
            <p>{textFor(isArabic, "مسار التطوير سيستبدل لاحقًا بنظام مستخدمين إداريين حقيقي.", "The development path will later be replaced by real admin users.")}</p>
          </article>
          <article>
            <Badge tone="info">API / Socket</Badge>
            <h3>{textFor(isArabic, "حماية الإنتاج مؤجلة", "Production hardening is later")}</h3>
            <p>{textFor(isArabic, "TODO لحماية admin endpoints وSocket rooms بدون كسر التجربة المحلية الحالية.", "TODO for protecting admin endpoints and Socket rooms without breaking the current local flow.")}</p>
          </article>
          <Button variant="secondary" onClick={() => placeholder("إعدادات الأمان الإنتاجية Placeholder.", "Production security settings are a Placeholder.")}>
            {textFor(isArabic, "إعدادات أمان Placeholder", "Security settings Placeholder")}
          </Button>
        </div>
      )}

      {activeTab === "team" && (
        <div className="admin-settings-tab-panel">
          <SectionHeader
            title={textFor(isArabic, "الفريق والصلاحيات", "Team and roles")}
            description={textFor(isArabic, "الأدوار المعروضة في لوحة الأدمن محصورة في owner وadmin وsupport فقط.", "Visible admin roles are limited to owner, admin, and support only.")}
            meta={ADMIN_TEAM_ROLES.join(" / ")}
          />
          <DataTable
            className="team-table advanced-admin-table"
            gridTemplateColumns="minmax(160px, 1.2fr) minmax(110px, .8fr) minmax(105px, .8fr) minmax(150px, 1fr)"
            columns={[
              { key: "name", label: textFor(isArabic, "الاسم", "Name") },
              { key: "role", label: textFor(isArabic, "الدور", "Role") },
              { key: "status", label: textFor(isArabic, "الحالة", "Status") },
              { key: "activity", label: textFor(isArabic, "آخر نشاط", "Last activity") }
            ]}
            rows={teamRows}
            renderRow={(member) => (
              <div className="admin-table-row" key={member.id}>
                <strong>{member.name}</strong>
                <Badge tone={member.role === "owner" ? "success" : member.role === "admin" ? "info" : "warning"}>{member.role}</Badge>
                <Badge tone="success">{statusLabel(member.status, isArabic)}</Badge>
                <span>{member.lastActivity} · {formatDate(new Date().toISOString(), isArabic, { dateOnly: true })}</span>
              </div>
            )}
          />
        </div>
      )}
    </section>
  );
}
