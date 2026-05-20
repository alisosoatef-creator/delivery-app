import { useEffect, useMemo, useState } from "react";
import { Badge, Button, DataTable, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { exportRowsToCsv, statusLabel, textFor } from "./adminFormatters.js";

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

const PRICING_EXPORT_COLUMNS = [
  { key: "cityName", label: "City", value: (rule) => rule.cityName || rule.cityId },
  { key: "baseFare", label: "Base fare", value: (rule) => rule.baseFareIls ?? rule.baseFare },
  { key: "perKm", label: "Per km", value: (rule) => rule.perKmIls ?? rule.pricePerKm },
  { key: "minimum", label: "Minimum", value: (rule) => rule.minimumFareIls ?? rule.minimumFare },
  { key: "active", label: "Active", value: (rule) => rule.isActive !== false ? "yes" : "no" }
];

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
    <section className="admin-panel admin-advanced-section">
      <SectionHeader
        title={textFor(isArabic, "المدن والأسعار", "Cities and pricing")}
        description={textFor(isArabic, "تعديل أسعار المدن وحالة التفعيل عبر قاعدة البيانات المحلية.", "Edit city fares and active state through the local database.")}
        meta={pricingRules.length}
        actions={<Button variant="secondary" onClick={() => exportRowsToCsv("pricing-rules.csv", pricingRules, PRICING_EXPORT_COLUMNS)} disabled={!pricingRules.length}>Export CSV</Button>}
      />
      <DataTable
        className="pricing-table advanced-admin-table"
        gridTemplateColumns="minmax(150px, 1fr) repeat(3, minmax(115px, .8fr)) minmax(115px, .8fr) minmax(90px, .7fr)"
        columns={[
          { key: "city", label: textFor(isArabic, "المدينة", "City") },
          { key: "base", label: textFor(isArabic, "سعر البداية", "Base fare") },
          { key: "km", label: textFor(isArabic, "سعر الكيلومتر", "Per km") },
          { key: "minimum", label: textFor(isArabic, "الحد الأدنى", "Minimum") },
          { key: "status", label: textFor(isArabic, "الحالة", "Status") },
          { key: "save", label: textFor(isArabic, "حفظ", "Save") }
        ]}
        rows={pricingRules}
        empty={<EmptyState title={textFor(isArabic, "لا توجد قواعد أسعار", "No pricing rules")} description={textFor(isArabic, "قواعد الأسعار ستظهر بعد تهيئة قاعدة البيانات.", "Pricing rules appear after database initialization.")} />}
        renderRow={(rule) => {
          const draft = drafts[rule.cityId] || buildDrafts([rule])[rule.cityId];
          return (
            <div className="admin-table-row" key={rule.id || rule.cityId}>
              <strong>{cityName(state, rule.cityId, isArabic) || rule.cityName}</strong>
              <input type="number" min="0" value={draft.baseFareIls} onChange={(event) => updateDraft(rule.cityId, "baseFareIls", event.target.value)} />
              <input type="number" min="0" value={draft.perKmIls} onChange={(event) => updateDraft(rule.cityId, "perKmIls", event.target.value)} />
              <input type="number" min="0" value={draft.minimumFareIls} onChange={(event) => updateDraft(rule.cityId, "minimumFareIls", event.target.value)} />
              <div className="pricing-status-control">
                <Badge tone={draft.isActive ? "success" : "neutral"}>{draft.isActive ? statusLabel("active", isArabic) : statusLabel("inactive", isArabic)}</Badge>
                <select value={draft.isActive ? "active" : "inactive"} onChange={(event) => updateDraft(rule.cityId, "isActive", event.target.value === "active")}>
                  <option value="active">{statusLabel("active", isArabic)}</option>
                  <option value="inactive">{statusLabel("inactive", isArabic)}</option>
                </select>
              </div>
              <Button variant="secondary" size="sm" onClick={() => updatePricingRule(rule.cityId, draft)} disabled={adminMutating}>
                {textFor(isArabic, "حفظ", "Save")}
              </Button>
            </div>
          );
        }}
      />
    </section>
  );
}
