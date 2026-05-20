import { useMemo, useState } from "react";
import { Badge, Button, DataTable, EmptyState, ErrorState, SectionHeader, Select, StatCard } from "../../components/ui/index.js";
import { usePayments } from "../../hooks/usePayments.js";
import { AdminDetailDrawer, DetailGrid, DrawerCloseButton, DrawerPlaceholder } from "./AdminDetailDrawer.jsx";
import { exportRowsToCsv, formatDate, formatMoney, normalizePayment, statusLabel, textFor } from "./adminFormatters.js";
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

const PAYMENT_EXPORT_COLUMNS = [
  { key: "rideId", label: "Ride ID", value: (payment) => payment.rideId },
  { key: "customerName", label: "Customer", value: (payment) => payment.customerName },
  { key: "driverName", label: "Driver", value: (payment) => payment.driverName },
  { key: "method", label: "Method", value: (payment) => payment.method },
  { key: "provider", label: "Provider", value: (payment) => payment.provider },
  { key: "amount", label: "Amount", value: (payment) => payment.amount },
  { key: "status", label: "Status", value: (payment) => payment.status },
  { key: "createdAt", label: "Created", value: (payment) => payment.createdAt }
];

export function AdminPayments({ adminRides, isArabic, state }) {
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const paymentsData = usePayments({
    enabled: Boolean(state?.session),
    adminEnabled: ["admin", "owner"].includes(state?.role)
  });
  const fallbackRecords = Array.isArray(adminRides) ? adminRides.map(paymentRecordFromRide) : mockPaymentRecords;
  const records = useMemo(
    () => (paymentsData.adminPayments.length ? paymentsData.adminPayments : fallbackRecords).map(normalizePayment),
    [fallbackRecords, paymentsData.adminPayments]
  );
  const filteredRecords = useMemo(
    () => records.filter((payment) =>
      (methodFilter === "all" || payment.method === methodFilter) &&
      (statusFilter === "all" || payment.status === statusFilter)
    ),
    [methodFilter, records, statusFilter]
  );
  const walletTransactions = paymentsData.adminWalletTransactions || [];
  const summary = paymentsData.adminPaymentSummary || {};
  const cashTotal = summary.cashTotal ?? records.filter((payment) => payment.method === "cash" && payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const visaTotal = summary.visaTotal ?? records.filter((payment) => payment.method === "visa" && payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const walletTotal = summary.walletTotal ?? records.filter((payment) => payment.method === "wallet" && payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const pendingCount = summary.pendingCount ?? records.filter((payment) => payment.status === "pending").length;

  return (
    <div className="admin-section-stack admin-advanced-section">
      <SectionHeader
        title={textFor(isArabic, "المدفوعات والمحافظ", "Payments and wallets")}
        description={textFor(isArabic, "متابعة كاش، VISA Placeholder، المحفظة، والسجل المالي المحلي بدون دفع حقيقي.", "Track cash, VISA Placeholder, wallet, and local ledger entries without real payment processing.")}
        meta={`${filteredRecords.length} / ${records.length}`}
        actions={<Button variant="secondary" onClick={() => exportRowsToCsv("admin-payments.csv", filteredRecords, PAYMENT_EXPORT_COLUMNS)} disabled={!filteredRecords.length}>Export CSV</Button>}
      />

      <div className="admin-stat-grid three admin-payment-summary">
        <StatCard className="admin-stat-card" label={textFor(isArabic, "كاش", "Cash")} value={formatMoney(cashTotal)} />
        <StatCard className="admin-stat-card" label="VISA Placeholder" value={formatMoney(visaTotal)} />
        <StatCard className="admin-stat-card" label={textFor(isArabic, "المحفظة", "Wallet")} value={formatMoney(walletTotal)} />
        <StatCard className="admin-stat-card" label={textFor(isArabic, "معلقة", "Pending")} value={pendingCount} />
      </div>

      <section className="admin-panel nested-admin-panel">
        <div className="admin-filter-row advanced-filter-bar">
          <Select label={textFor(isArabic, "طريقة الدفع", "Method")} value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
            <option value="all">{textFor(isArabic, "كل الطرق", "All methods")}</option>
            <option value="cash">{statusLabel("cash", isArabic)}</option>
            <option value="visa">VISA Placeholder</option>
            <option value="wallet">{statusLabel("wallet", isArabic)}</option>
          </Select>
          <Select label={textFor(isArabic, "الحالة", "Status")} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">{statusLabel("all", isArabic)}</option>
            <option value="pending">{statusLabel("pending", isArabic)}</option>
            <option value="paid">{statusLabel("paid", isArabic)}</option>
            <option value="failed">{statusLabel("failed", isArabic)}</option>
            <option value="refunded">{statusLabel("refunded", isArabic)}</option>
          </Select>
          <Button variant="secondary" onClick={() => paymentsData.refetchAdminPayments()} disabled={paymentsData.isLoading}>
            {textFor(isArabic, "تحديث", "Refresh")}
          </Button>
        </div>

        {paymentsData.backendError && (
          <ErrorState
            title={textFor(isArabic, "تعذر تحميل المدفوعات", "Unable to load payments")}
            description={textFor(isArabic, "تظهر بيانات fallback مؤقتًا. الدفع الإلكتروني لا يزال تجريبيًا.", "Fallback data is visible. Electronic payment remains a placeholder.")}
          />
        )}

        <DataTable
          className="payments-table admin-payments-table advanced-admin-table"
          gridTemplateColumns="minmax(130px, 1fr) minmax(150px, 1.2fr) minmax(140px, 1fr) minmax(120px, .9fr) minmax(135px, 1fr) minmax(90px, .7fr) minmax(100px, .8fr) minmax(130px, 1fr) minmax(90px, .7fr)"
          columns={[
            { key: "ride", label: textFor(isArabic, "الرحلة", "Ride") },
            { key: "customer", label: textFor(isArabic, "الزبون", "Customer") },
            { key: "driver", label: textFor(isArabic, "الكابتن", "Captain") },
            { key: "method", label: textFor(isArabic, "الطريقة", "Method") },
            { key: "provider", label: "Provider" },
            { key: "amount", label: textFor(isArabic, "المبلغ", "Amount") },
            { key: "status", label: textFor(isArabic, "الحالة", "Status") },
            { key: "date", label: textFor(isArabic, "التاريخ", "Date") },
            { key: "details", label: textFor(isArabic, "تفاصيل", "Details") }
          ]}
          rows={filteredRecords}
          empty={<EmptyState title={textFor(isArabic, "لا توجد عمليات دفع", "No payment records")} description={textFor(isArabic, "سيظهر سجل الدفع بعد إنشاء أو إكمال الرحلات.", "Payment records appear after ride payment activity.")} />}
          renderRow={(payment) => (
            <div className="admin-table-row" key={payment.id}>
              <strong>{payment.rideId}</strong>
              <span>{payment.customerName}</span>
              <span>{payment.driverName}</span>
              <span>{payment.method === "visa" ? "VISA Placeholder" : statusLabel(payment.method, isArabic)}</span>
              <span>{payment.provider}</span>
              <span>{formatMoney(payment.amount)}</span>
              <Badge tone={payment.status === "paid" ? "success" : payment.status === "failed" ? "danger" : "warning"}>{statusLabel(payment.status, isArabic)}</Badge>
              <span>{formatDate(payment.createdAt, isArabic)}</span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedPayment(payment)}>{textFor(isArabic, "عرض", "View")}</Button>
            </div>
          )}
        />
      </section>

      <section className="admin-panel nested-admin-panel">
        <SectionHeader
          title={textFor(isArabic, "عمليات المحافظ", "Wallet transactions")}
          description={textFor(isArabic, "سجل مبدئي لأرصدة الزبائن وأرباح الكباتن.", "Initial ledger for customer wallet and captain earnings.")}
          meta={walletTransactions.length}
        />
        <DataTable
          className="wallet-transactions-table advanced-admin-table"
          gridTemplateColumns="minmax(130px, 1fr) minmax(90px, .7fr) minmax(130px, 1fr) minmax(100px, .8fr) minmax(95px, .7fr) minmax(150px, 1fr)"
          columns={[
            { key: "ref", label: textFor(isArabic, "المرجع", "Reference") },
            { key: "role", label: textFor(isArabic, "الدور", "Role") },
            { key: "phone", label: textFor(isArabic, "الهاتف", "Phone") },
            { key: "type", label: textFor(isArabic, "النوع", "Type") },
            { key: "amount", label: textFor(isArabic, "المبلغ", "Amount") },
            { key: "date", label: textFor(isArabic, "التاريخ", "Date") }
          ]}
          rows={walletTransactions.slice(0, 8)}
          empty={<EmptyState title={textFor(isArabic, "لا توجد عمليات محفظة", "No wallet transactions")} description={textFor(isArabic, "ستظهر عمليات الأرباح والمحفظة هنا.", "Wallet and earning entries will appear here.")} />}
          renderRow={(transaction) => (
            <div className="admin-table-row" key={transaction.id}>
              <strong>{transaction.referenceId || transaction.id}</strong>
              <span>{statusLabel(transaction.role, isArabic)}</span>
              <span>{transaction.userPhone || transaction.userId || "-"}</span>
              <span>{transaction.type}</span>
              <span>{formatMoney(transaction.amountIls ?? transaction.amount)}</span>
              <span>{formatDate(transaction.createdAt, isArabic)}</span>
            </div>
          )}
        />
      </section>

      <AdminDetailDrawer
        open={Boolean(selectedPayment)}
        title={selectedPayment?.rideId || ""}
        subtitle={textFor(isArabic, "تفاصيل عملية الدفع", "Payment details")}
        status={selectedPayment?.status}
        isArabic={isArabic}
        onClose={() => setSelectedPayment(null)}
        actions={<DrawerCloseButton isArabic={isArabic} onClick={() => setSelectedPayment(null)} />}
      >
        {selectedPayment && (
          <>
            <DetailGrid
              items={[
                { label: textFor(isArabic, "رقم الرحلة", "Ride ID"), value: selectedPayment.rideId },
                { label: textFor(isArabic, "الزبون", "Customer"), value: selectedPayment.customerName },
                { label: textFor(isArabic, "الكابتن", "Captain"), value: selectedPayment.driverName },
                { label: textFor(isArabic, "طريقة الدفع", "Method"), value: selectedPayment.method === "visa" ? "VISA Placeholder" : statusLabel(selectedPayment.method, isArabic) },
                { label: "Provider", value: selectedPayment.provider },
                { label: textFor(isArabic, "المبلغ", "Amount"), value: formatMoney(selectedPayment.amount) },
                { label: textFor(isArabic, "الحالة", "Status"), value: statusLabel(selectedPayment.status, isArabic) },
                { label: textFor(isArabic, "التاريخ", "Date"), value: formatDate(selectedPayment.createdAt, isArabic) }
              ]}
            />
            <DrawerPlaceholder title={textFor(isArabic, "ملاحظة الدفع", "Payment note")}>
              {textFor(isArabic, "VISA ما زالت Placeholder ولا يتم تخزين رقم بطاقة كامل أو CVV.", "VISA remains a placeholder. Full card numbers and CVV are not stored.")}
            </DrawerPlaceholder>
          </>
        )}
      </AdminDetailDrawer>
    </div>
  );
}
