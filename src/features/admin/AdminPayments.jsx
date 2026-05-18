import { mockPaymentRecords } from "./adminMockData.js";

function paymentRecordFromRide(ride) {
  return {
    id: `payment_${ride.id}`,
    rideId: ride.id,
    method: ride.paymentMethod || "cash",
    amountIls: ride.fareIls ?? ride.price ?? 0,
    status: ride.status === "completed" ? "collected" : "pending",
    createdAt: ride.createdAt
  };
}

export function AdminPayments({ adminRides, isArabic }) {
  const records = Array.isArray(adminRides) ? adminRides.map(paymentRecordFromRide) : mockPaymentRecords;
  const cashTotal = records.filter((payment) => payment.method === "cash").reduce((sum, payment) => sum + payment.amountIls, 0);
  const visaTotal = records.filter((payment) => payment.method === "visa").reduce((sum, payment) => sum + payment.amountIls, 0);
  const total = cashTotal + visaTotal;
  const paidRides = records.filter((payment) => payment.status === "collected").length;

  return (
    <div className="admin-section-stack">
      <div className="admin-stat-grid three">
        <section className="admin-stat-card"><span>{isArabic ? "كاش" : "Cash"}</span><strong>{cashTotal} ₪</strong></section>
        <section className="admin-stat-card"><span>VISA Placeholder</span><strong>{visaTotal} ₪</strong></section>
        <section className="admin-stat-card"><span>{isArabic ? "رحلات مدفوعة" : "Paid rides"}</span><strong>{paidRides}</strong></section>
        <section className="admin-stat-card"><span>{isArabic ? "الإجمالي التقديري" : "Estimated total"}</span><strong>{total} ₪</strong></section>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-title">
          <div>
            <h2>{isArabic ? "سجل العمليات المبدئي" : "Initial transaction log"}</h2>
            <p>{isArabic ? "VISA لا تزال Placeholder ولا يوجد دفع حقيقي أو تخزين بطاقات." : "VISA remains a Placeholder; no real payment or card storage exists."}</p>
          </div>
          <span>{records.length}</span>
        </div>
        <div className="admin-data-table payments-table">
          {records.length ? records.map((payment) => (
            <div className="admin-table-row" key={payment.id}>
              <strong>{payment.id}</strong>
              <span>{payment.rideId}</span>
              <span>{payment.method === "visa" ? "VISA Placeholder" : "Cash"}</span>
              <span>{payment.amountIls} ₪</span>
              <b className={`admin-badge ${payment.status}`}>{payment.status}</b>
            </div>
          )) : (
            <p className="admin-empty">{isArabic ? "لا توجد عمليات دفع بعد." : "No payment records yet."}</p>
          )}
        </div>
      </section>
    </div>
  );
}
