import { mockPaymentRecords } from "./adminMockData.js";

export function AdminPayments({ isArabic }) {
  const cashTotal = mockPaymentRecords.filter((payment) => payment.method === "cash").reduce((sum, payment) => sum + payment.amountIls, 0);
  const visaTotal = mockPaymentRecords.filter((payment) => payment.method === "visa").reduce((sum, payment) => sum + payment.amountIls, 0);
  const total = cashTotal + visaTotal;

  return (
    <div className="admin-section-stack">
      <div className="admin-stat-grid three">
        <section className="admin-stat-card"><span>{isArabic ? "كاش" : "Cash"}</span><strong>{cashTotal} ₪</strong></section>
        <section className="admin-stat-card"><span>VISA Placeholder</span><strong>{visaTotal} ₪</strong></section>
        <section className="admin-stat-card"><span>{isArabic ? "الإجمالي التقديري" : "Estimated total"}</span><strong>{total} ₪</strong></section>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-title">
          <h2>{isArabic ? "سجل العمليات المبدئي" : "Initial transaction log"}</h2>
          <span>{mockPaymentRecords.length}</span>
        </div>
        <div className="admin-data-table">
          {mockPaymentRecords.map((payment) => (
            <div className="admin-table-row" key={payment.id}>
              <strong>{payment.id}</strong>
              <span>{payment.rideId}</span>
              <span>{payment.method === "visa" ? "VISA Placeholder" : "Cash"}</span>
              <span>{payment.amountIls} ₪</span>
              <b className={`admin-badge ${payment.status}`}>{payment.status}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
