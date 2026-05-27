import { useMemo, useState } from "react";
import { Badge, Button, DataTable, EmptyState, ErrorState, Input, LoadingSkeleton, SectionHeader, Select } from "../../components/ui/index.js";
import { AdminDetailDrawer, AdminTimeline, DetailGrid, DrawerCloseButton, DrawerPlaceholder } from "./AdminDetailDrawer.jsx";
import {
  ADMIN_RIDE_STATUSES,
  exportRowsToCsv,
  formatDate,
  formatDistance,
  formatMoney,
  normalizeRide,
  adminStatusTone,
  paymentMethodLabel,
  statusLabel,
  textFor
} from "./adminFormatters.js";
import { mockRideRecords } from "./adminMockData.js";

const RIDE_COLUMNS = [
  { key: "id", label: "Ride ID", value: (ride) => ride.id },
  { key: "customer", label: "Customer", value: (ride) => ride.customer },
  { key: "customerPhone", label: "Phone", value: (ride) => ride.customerPhone },
  { key: "captain", label: "Captain", value: (ride) => ride.captain || "Pending" },
  { key: "route", label: "From / to", value: (ride) => `${ride.pickup} / ${ride.dropoff}` },
  { key: "city", label: "City", value: (ride) => ride.city },
  { key: "distance", label: "Distance", value: (ride) => formatDistance(ride.distanceKm) },
  { key: "fare", label: "Fare", value: (ride) => formatMoney(ride.fareIls) },
  { key: "paymentMethod", label: "Payment", value: (ride) => ride.paymentMethod },
  { key: "status", label: "Status", value: (ride) => ride.status },
  { key: "createdAt", label: "Created", value: (ride) => ride.createdAt }
];

export function AdminRides({ state, isArabic, adminRides, adminLoading, backendError }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRide, setSelectedRide] = useState(null);

  const rides = useMemo(() => {
    if (adminRides) return adminRides.map(normalizeRide);
    if (state.ride) {
      return [
        normalizeRide({
          ...state.ride,
          customerName: state.session?.name || state.currentUser?.fullName || "Customer",
          customerPhone: state.currentUser?.phone || state.session?.phone,
          paymentMethod: state.paymentMethod,
          createdAt: state.ride.createdAt || "Live"
        }),
        ...mockRideRecords.map(normalizeRide)
      ];
    }
    return mockRideRecords.map(normalizeRide);
  }, [adminRides, state.currentUser?.fullName, state.currentUser?.phone, state.paymentMethod, state.ride, state.session?.name, state.session?.phone]);

  const filteredRides = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return rides.filter((ride) => {
      const matchesStatus = statusFilter === "all" || ride.status === statusFilter;
      const matchesCity = cityFilter === "all" || ride.city === cityFilter;
      const searchableText = `${ride.id} ${ride.customer} ${ride.customerPhone} ${ride.pickup} ${ride.dropoff} ${ride.city}`.toLowerCase();
      return matchesStatus && matchesCity && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [cityFilter, rides, searchTerm, statusFilter]);

  const completedCount = rides.filter((ride) => ride.status === "completed").length;
  const cancelledCount = rides.filter((ride) => ride.status === "cancelled").length;
  const activeCount = rides.filter((ride) => ["searching", "accepted", "driver_arriving", "arrived", "in_progress"].includes(ride.status)).length;
  const cityOptions = useMemo(() => ["all", ...new Set(rides.map((ride) => ride.city).filter(Boolean))], [rides]);

  return (
    <section className="admin-panel admin-advanced-section">
      <SectionHeader
        title={textFor(isArabic, "إدارة الرحلات", "Ride management")}
        description={textFor(isArabic, "جداول رحلات متقدمة مع بحث، فلاتر، Timeline، وتصدير CSV للبيانات المعروضة فقط.", "Advanced ride table with search, filters, timeline details, and CSV export for visible data only.")}
        meta={`${filteredRides.length} / ${rides.length}`}
        actions={
          <Button variant="secondary" onClick={() => exportRowsToCsv("admin-rides.csv", filteredRides, RIDE_COLUMNS)} disabled={!filteredRides.length}>
            Export CSV
          </Button>
        }
      />

      <div className="admin-analytics-strip admin-super-summary">
        <div><span>{textFor(isArabic, "نشطة", "Active")}</span><strong>{activeCount}</strong></div>
        <div><span>{textFor(isArabic, "مكتملة", "Completed")}</span><strong>{completedCount}</strong></div>
        <div><span>{textFor(isArabic, "ملغاة", "Cancelled")}</span><strong>{cancelledCount}</strong></div>
        <div><span>{textFor(isArabic, "متوسط السعر", "Avg fare")}</span><strong>{formatMoney(rides.reduce((sum, ride) => sum + Number(ride.fareIls || 0), 0) / Math.max(rides.length, 1))}</strong></div>
      </div>

      <p className="admin-live-location-note">{textFor(isArabic, "تتبّع موقع الكابتن مباشر عبر Socket.IO حاليًا، وسجل المواقع التفصيلي مؤجل لمرحلة لاحقة.", "Captain live location is Socket.IO-based now; detailed location history remains a later TODO.")}</p>

      <div className="admin-filter-bar advanced-filter-bar">
        <Input
          label={textFor(isArabic, "بحث", "Search")}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={textFor(isArabic, "الزبون، الهاتف، نقطة الانطلاق أو الوجهة", "Customer, phone, pickup, or destination")}
        />
        <Select label={textFor(isArabic, "الحالة", "Status")} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {ADMIN_RIDE_STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status, isArabic)}</option>)}
        </Select>
        <Select label={textFor(isArabic, "المدينة", "City")} value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
          {cityOptions.map((city) => <option key={city} value={city}>{city === "all" ? statusLabel("all", isArabic) : city}</option>)}
        </Select>
      </div>

      {adminLoading && <LoadingSkeleton lines={5} />}
      {backendError && (
        <ErrorState
          title={textFor(isArabic, "تعذر تحميل الرحلات من الخادم", "Unable to load rides")}
          description={textFor(isArabic, "تظهر بيانات fallback مؤقتًا، ويمكنك إعادة المحاولة بعد عودة الاتصال.", "Fallback data is visible until the backend connection returns.")}
        />
      )}

      <DataTable
        className="rides-table advanced-admin-table"
        gridTemplateColumns="minmax(120px, 1fr) minmax(150px, 1.2fr) minmax(120px, .9fr) minmax(140px, 1fr) minmax(220px, 1.6fr) minmax(90px, .8fr) minmax(100px, .8fr) minmax(90px, .8fr) minmax(90px, .8fr) minmax(115px, .9fr) minmax(130px, 1fr) minmax(88px, .7fr)"
        columns={[
          { key: "id", label: textFor(isArabic, "رقم الرحلة", "Ride ID") },
          { key: "customer", label: textFor(isArabic, "الزبون", "Customer") },
          { key: "phone", label: textFor(isArabic, "الهاتف", "Phone") },
          { key: "captain", label: textFor(isArabic, "الكابتن", "Captain") },
          { key: "route", label: textFor(isArabic, "من / إلى", "From / to") },
          { key: "city", label: textFor(isArabic, "المدينة", "City") },
          { key: "distance", label: textFor(isArabic, "المسافة", "Distance") },
          { key: "fare", label: textFor(isArabic, "السعر", "Fare") },
          { key: "payment", label: textFor(isArabic, "الدفع", "Payment") },
          { key: "status", label: textFor(isArabic, "الحالة", "Status") },
          { key: "created", label: textFor(isArabic, "الإنشاء", "Created") },
          { key: "details", label: textFor(isArabic, "تفاصيل", "Details") }
        ]}
        rows={filteredRides}
        empty={<EmptyState title={textFor(isArabic, "لا توجد رحلات مطابقة", "No matching rides")} description={textFor(isArabic, "جرّب تعديل البحث أو الفلاتر.", "Try adjusting search or filters.")} />}
        renderRow={(ride) => (
          <div className="admin-table-row" key={ride.id}>
            <strong>{ride.id}</strong>
            <span>{ride.customer}</span>
            <span>{ride.customerPhone || "-"}</span>
            <span>{ride.captain || textFor(isArabic, "بانتظار كابتن", "Pending captain")}</span>
            <span>{ride.pickup} / {ride.dropoff}</span>
            <span>{ride.city}</span>
            <span>{formatDistance(ride.distanceKm)}</span>
            <span>{formatMoney(ride.fareIls)}</span>
            <span>{paymentMethodLabel(ride.paymentMethod, isArabic)}</span>
            <Badge className="admin-status-badge-ar" tone={adminStatusTone(ride.status)}>{statusLabel(ride.status, isArabic)}</Badge>
            <span>{formatDate(ride.createdAt, isArabic)}</span>
            <Button variant="secondary" size="sm" onClick={() => setSelectedRide(ride)}>
              {textFor(isArabic, "عرض", "View")}
            </Button>
          </div>
        )}
      />

      <AdminDetailDrawer
        open={Boolean(selectedRide)}
        title={selectedRide?.id || ""}
        subtitle={textFor(isArabic, "تفاصيل الرحلة", "Ride details")}
        status={selectedRide?.status}
        isArabic={isArabic}
        onClose={() => setSelectedRide(null)}
        actions={<DrawerCloseButton isArabic={isArabic} onClick={() => setSelectedRide(null)} />}
      >
        {selectedRide && (
          <>
            <DetailGrid
              items={[
                { label: textFor(isArabic, "الزبون", "Customer"), value: selectedRide.customer },
                { label: textFor(isArabic, "رقم الزبون", "Customer phone"), value: selectedRide.customerPhone },
                { label: textFor(isArabic, "الكابتن", "Captain"), value: selectedRide.captain || textFor(isArabic, "لم يقبلها كابتن بعد", "No captain accepted yet") },
                { label: textFor(isArabic, "من", "Pickup"), value: selectedRide.pickup },
                { label: textFor(isArabic, "إلى", "Destination"), value: selectedRide.dropoff },
                { label: textFor(isArabic, "المدينة", "City"), value: selectedRide.city },
                { label: textFor(isArabic, "المسافة", "Distance"), value: formatDistance(selectedRide.distanceKm) },
                { label: textFor(isArabic, "الوقت المتوقع", "ETA"), value: selectedRide.durationMinutes ? `${selectedRide.durationMinutes} min` : "-" },
                { label: textFor(isArabic, "السعر", "Fare"), value: formatMoney(selectedRide.fareIls) },
                { label: textFor(isArabic, "طريقة الدفع", "Payment method"), value: paymentMethodLabel(selectedRide.paymentMethod, isArabic) },
                { label: textFor(isArabic, "حالة الدفع", "Payment status"), value: selectedRide.paymentStatus || textFor(isArabic, "غير محدد", "Not set") },
                { label: textFor(isArabic, "تاريخ الإنشاء", "Created at"), value: formatDate(selectedRide.createdAt, isArabic) },
                { label: textFor(isArabic, "وقت القبول", "Accepted at"), value: formatDate(selectedRide.acceptedAt, isArabic) },
                { label: textFor(isArabic, "وقت الإلغاء", "Cancelled at"), value: formatDate(selectedRide.cancelledAt, isArabic) },
                { label: textFor(isArabic, "وقت الإكمال", "Completed at"), value: formatDate(selectedRide.completedAt, isArabic) }
              ]}
            />
            <AdminTimeline status={selectedRide.status} isArabic={isArabic} timestamps={selectedRide} />
            <DrawerPlaceholder title={textFor(isArabic, "ملاحظات الإدارة", "Admin notes")}>
              {textFor(isArabic, "Placeholder لملاحظات داخلية على الرحلة في مرحلة لاحقة.", "Placeholder for internal ride notes in a later phase.")}
            </DrawerPlaceholder>
          </>
        )}
      </AdminDetailDrawer>
    </section>
  );
}
