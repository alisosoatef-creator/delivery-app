export function AdminPricing({ state, pricingRules, updatePricingRule, isArabic, cityName }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <div>
          <h2>{isArabic ? "المدن والأسعار" : "Cities and pricing"}</h2>
          <p>{isArabic ? "تعديل محلي مبدئي لسعر البداية وسعر الكيلومتر والحد الأدنى." : "Local editing for base fare, per-km fare, and minimum fare."}</p>
        </div>
        <span>{pricingRules.length}</span>
      </div>
      <div className="admin-data-table">
        <div className="admin-table-row admin-table-head">
          <span>{isArabic ? "المدينة" : "City"}</span>
          <span>{isArabic ? "سعر البداية" : "Base fare"}</span>
          <span>{isArabic ? "سعر الكيلومتر" : "Per km"}</span>
          <span>{isArabic ? "الحد الأدنى" : "Minimum"}</span>
          <span>{isArabic ? "تعديل" : "Edit"}</span>
        </div>
        {pricingRules.map((rule) => (
          <div className="admin-table-row" key={rule.id}>
            <strong>{cityName(state, rule.cityId, isArabic)}</strong>
            <span>{rule.baseFareIls} ₪</span>
            <span>{rule.perKmIls} ₪</span>
            <span>{rule.minimumFareIls} ₪</span>
            <button
              className="secondary"
              type="button"
              onClick={() => updatePricingRule(rule.id, { baseFareIls: rule.baseFareIls + 1 })}
            >
              {isArabic ? "تعديل محلي" : "Local edit"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
