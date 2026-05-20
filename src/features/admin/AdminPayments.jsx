import { useMemo, useState } from "react";
import { StatusBadge } from "../../components/ui/index.js";
import { usePayments } from "../../hooks/usePayments.js";
import { mockPaymentRecords } from "./adminMockData.js";

function paymentRecordFromRide(ride) {
  return {
    id: `payment_${ride.id}`,
    rideId: ride.id,
    customerName: ride.customerName || ride.customer || "-",
    driverName: ride.driverName || ride.driver?.fullName || "-",
    method: ride.paymentMethod || "cash",
    amountIls: ride.fareIls ?? ride.price ?? 0,
    status: ride.status === "completed" ? "paid" : "pending",
    provider: ride.paymentMethod === "visa" ? "visa-placeholder" : "cash/manual",
    createdAt: ride.createdAt
  };
}

function formatDate(value, isArabic) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(isArabic ? "ar" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function methodLabel(method, isArabic) {
  if (method === "visa") return "VISA Placeholder";
  if (method === "wallet") return isArabic ? "محفظة" : "Wallet";
  return isArabic ? "كاش" : "Cash";
}

export function AdminPayments({ adminRides, isArabic, state }) {
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const paymentsData = usePayments({
    enabled: Boolean(state?.session),
    adminEnabled: ["admin", "owner"].includes(state?.role)
  });
  const fallbackRecords = Array.isArray(adminRides) ? adminRides.map(paymentRecordFromRide) : mockPaymentRecords;
  const records = paymentsData.adminPayments.length ? paymentsData.adminPayments : fallbackRecords;
  const filteredRecords = useMemo(
    () => records.filter((payment) =>
      (methodFilter === "all" || payment.method === methodFilter) &&
      (statusFilter === "all" || payment.status === statusFilter)
    ),
    [methodFilter, records, statusFilter]
  );
  const walletTransactions = paymentsData.adminWalletTransactions || [];
  const summary = paymentsData.adminPaymentSummary || {};
  const cashTotal = summary.cashTotal ?? records.filter((payment) => payment.method === "cash" && payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amountIls || payment.amount || 0), 0);
  const visaTotal = summary.visaTotal ?? records.filter((payment) => payment.method === "visa" && payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amountIls || payment.amount || 0), 0);
  const walletTotal = summary.walletTotal ?? records.filter((payment) => payment.method === "wallet" && payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amountIls || payment.amount || 0), 0);
  const pendingCount = summary.pendingCount ?? records.filter((payment) => payment.status === "pending").length;

  return (
    <div className="admin-section-stack">
      <div className="admin-stat-grid three admin-payment-summary">
        <section className="admin-stat-card"><span>{isArabic ? "كاش" : "Cash"}</span><strong>{cashTotal} ₪</strong></section>
        <section className="admin-stat-card"><span>VISA Placeholder</span><strong>{visaTotal} ₪</strong></section>
        <section className="admin-stat-card"><span>{isArabic ? "المحفظة" : "Wallet"}</span><strong>{walletTotal} ₪</strong></section>
        <section className="admin-stat-card"><span>{isArabic ? "معلقة" : "Pending"}</span><strong>{pendingCount}</strong></section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-title">
          <div>
            <h2>{isArabic ? "سجل المدفوعات" : "Payment records"}</h2>
            <p>{isArabic ? "المدفوعات محفوظة في SQLite. VISA لا تزال Placeholder ولا يوجد دفع حقيقي." : "Payments are stored in SQLite. VISA remains a placeholder with no real charge."}</p>
          </div>
          <span>{filteredRecords.length}</span>
        </div>

        <div className="admin-filter-row">
          <select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
            <option value="all">{isArabic ? "كل الطرق" : "All methods"}</option>
            <option value="cash">{isArabic ? "كاش" : "Cash"}</option>
            <option value="visa">VISA Placeholder</option>
            <option value="wallet">{isArabic ? "محفظة" : "Wallet"}</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">{isArabic ? "كل الحالات" : "All statuses"}</option>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="failed">failed</option>
            <option value="refunded">refunded</option>
          </select>
          <button className="secondary" type="button" onClick={() => paymentsData.refetchAdminPayments()} disabled={paymentsData.isLoading}>
            {isArabic ? "تحديث" : "Refresh"}
          </button>
        </div>

        {paymentsData.backendError && (
          <p className="admin-error">{isArabic ? "تعذر تحميل المدفوعات من Backend، يتم عرض fallback مؤقت." : "Unable to load Backend payments, showing fallback data."}</p>
        )}

        <div className="admin-data-table payments-table admin-payments-table">
          {filteredRecords.length ? filteredRecords.map((payment) => (
            <div className="admin-table-row" key={payment.id}>
              <strong>{payment.rideId || payment.id}</strong>
              <span>{payment.customerName || payment.customerPhone || "-"}</span>
              <span>{payment.driverName || payment.driverId || "-"}</span>
              <span>{methodLabel(payment.method, isArabic)}</span>
              <span>{payment.provider || "-"}</span>
              <span>{payment.amountIls ?? payment.amount ?? 0} ₪</span>
              <StatusBadge status={payment.status} label={payment.status} />
              <small>{formatDate(payment.createdAt, isArabic)}</small>
            </div>
          )) : (
            <p className="admin-empty">{isArabic ? "لا توجد عمليات دفع بعد." : "No payment records yet."}</p>
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-title">
          <div>
            <h2>{isArabic ? "عمليات المحافظ" : "Wallet transactions"}</h2>
            <p>{isArabic ? "سجل مبدئي لأرصدة الزبائن وأرباح الكباتن." : "Initial ledger for customer wallet and captain earnings."}</p>
          </div>
          <span>{walletTransactions.length}</span>
        </div>
        <div className="admin-data-table wallet-transactions-table">
          {walletTransactions.length ? walletTransactions.slice(0, 8).map((transaction) => (
            <div className="admin-table-row" key={transaction.id}>
              <strong>{transaction.referenceId || transaction.id}</strong>
              <span>{transaction.role}</span>
              <span>{transaction.userPhone || transaction.userId || "-"}</span>
              <span>{transaction.type}</span>
              <span>{transaction.amountIls ?? transaction.amount} ₪</span>
              <small>{formatDate(transaction.createdAt, isArabic)}</small>
            </div>
          )) : (
            <p className="admin-empty">{isArabic ? "لا توجد عمليات محفظة بعد." : "No wallet transactions yet."}</p>
          )}
        </div>
      </section>
    </div>
  );
}
