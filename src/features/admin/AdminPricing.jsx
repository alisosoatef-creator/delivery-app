import { useEffect, useMemo, useState } from "react";

function buildDrafts(pricingRules) {
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

export function AdminPricing({ state, pricingRules, updatePricingRule, adminMutating, isArabic, cityName }) {
  const [drafts, setDrafts] = useState(() => buildDrafts(pricingRules));
  const draftKey = useMemo(() => pricingRules.map((rule) => `${rule.cityId}:${rule.updatedAt}:${rule.isActive}`).join("|"), [pricingRules]);

  useEffect(() => {
    setDrafts(buildDrafts(pricingRules));
  }, [draftKey, pricingRules]);

  function updateDraft(cityId, field, value) {
    setDrafts((current) => ({
      ...current,
      [cityId]: {
        ...current[cityId],
        [field]: field === "isActive" ? value : Number(value)
      }
    }));
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "المدن والأسعار" : "Cities and pricing"}</h2>
          <p>{isArabic ? "تعديل أسعار المدن وحالة التفعيل عبر قاعدة البيانات." : "Edit city fares and active state through the database."}</p>
        </div>
        <span>{pricingRules.length}</span>
      </div>
      <div className="admin-data-table pricing-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "المدينة" : "City"}</span>
          <span>{isArabic ? "سعر البداية" : "Base fare"}</span>
          <span>{isArabic ? "سعر الكيلومتر" : "Per km"}</span>
          <span>{isArabic ? "الحد الأدنى" : "Minimum"}</span>
          <span>{isArabic ? "الحالة" : "Status"}</span>
          <span>{isArabic ? "حفظ" : "Save"}</span>
        </div>
        {pricingRules.length ? pricingRules.map((rule) => {
          const draft = drafts[rule.cityId] || buildDrafts([rule])[rule.cityId];
          return (
            <div className="admin-table-row" key={rule.id}>
              <strong>{cityName(state, rule.cityId, isArabic) || rule.cityName}</strong>
              <input type="number" min="0" value={draft.baseFareIls} onChange={(event) => updateDraft(rule.cityId, "baseFareIls", event.target.value)} />
              <input type="number" min="0" value={draft.perKmIls} onChange={(event) => updateDraft(rule.cityId, "perKmIls", event.target.value)} />
              <input type="number" min="0" value={draft.minimumFareIls} onChange={(event) => updateDraft(rule.cityId, "minimumFareIls", event.target.value)} />
              <select value={draft.isActive ? "active" : "inactive"} onChange={(event) => updateDraft(rule.cityId, "isActive", event.target.value === "active")}>
                <option value="active">{isArabic ? "مفعلة" : "Active"}</option>
                <option value="inactive">{isArabic ? "معطلة" : "Inactive"}</option>
              </select>
              <button className="secondary" type="button" onClick={() => updatePricingRule(rule.cityId, draft)} disabled={adminMutating}>
                {isArabic ? "حفظ" : "Save"}
              </button>
            </div>
          );
        }) : (
          <p className="admin-empty">{isArabic ? "لا توجد قواعد أسعار بعد." : "No pricing rules yet."}</p>
        )}
      </div>
    </section>
  );
}
