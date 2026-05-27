import { useMemo, useState } from "react";
import { Badge, Button, DataTable, EmptyState, Input, SectionHeader, Select } from "../../components/ui/index.js";
import { AdminDetailDrawer, DetailGrid, DrawerCloseButton, DrawerPlaceholder } from "./AdminDetailDrawer.jsx";
import { adminStatusTone, exportRowsToCsv, formatDate, formatMoney, normalizeDriver, normalizeRide, normalizeTicket, statusLabel, textFor } from "./adminFormatters.js";

const DRIVER_EXPORT_COLUMNS = [
  { key: "name", label: "Name", value: (driver) => driver.name },
  { key: "phone", label: "Phone", value: (driver) => driver.phone },
  { key: "city", label: "City", value: (driver) => driver.city },
  { key: "vehicle", label: "Vehicle", value: (driver) => driver.vehicle },
  { key: "plate", label: "Plate", value: (driver) => driver.plate },
  { key: "status", label: "Status", value: (driver) => driver.status },
  { key: "online", label: "Availability", value: (driver) => driver.onlineStatus },
  { key: "rating", label: "Rating", value: (driver) => `${driver.rating}${driver.ratingCount ? ` (${driver.ratingCount})` : ""}` }
];

export function AdminDrivers({ state, approvedCaptains, isArabic, cityName, adminDrivers, updateDriverStatus, adminMutating, adminRides, supportTickets }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlineFilter, setOnlineFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const fallbackDrivers = [
    ...state.drivers.map((driver) => ({ ...driver, status: "active", availability: driver.online ? "online" : "offline" })),
    ...approvedCaptains
  ];
  const drivers = useMemo(
    () => (adminDrivers || fallbackDrivers).map((driver) => normalizeDriver(driver, cityName(state, driver.cityId || driver.city, isArabic))),
    [adminDrivers, approvedCaptains, cityName, fallbackDrivers, isArabic, state]
  );
  const rides = useMemo(() => (adminRides || []).map(normalizeRide), [adminRides]);
  const tickets = useMemo(() => (supportTickets || []).map(normalizeTicket), [supportTickets]);

  const filteredDrivers = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return drivers.filter((driver) => {
      const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
      const matchesOnline = onlineFilter === "all" || driver.onlineStatus === onlineFilter;
      const searchable = `${driver.name} ${driver.phone} ${driver.city} ${driver.vehicle} ${driver.plate}`.toLowerCase();
      return matchesStatus && matchesOnline && (!needle || searchable.includes(needle));
    });
  }, [drivers, onlineFilter, searchTerm, statusFilter]);
  const onlineCount = drivers.filter((driver) => driver.onlineStatus === "online").length;
  const activeCount = drivers.filter((driver) => driver.status === "active").length;
  const suspendedCount = drivers.filter((driver) => driver.status === "suspended").length;

  function driverRides(driver) {
    return rides.filter((ride) => ride.driverId === driver.id || ride.captain === driver.name || ride.captain === driver.id).slice(0, 5);
  }

  function driverTickets(driver) {
    return tickets.filter((ticket) => ticket.role === "driver" && (ticket.phone === driver.phone || ticket.name === driver.name)).slice(0, 4);
  }

  return (
    <section className="admin-panel admin-advanced-section">
      <SectionHeader
        title={textFor(isArabic, "إدارة الكباتن", "Captain management")}
        description={textFor(isArabic, "عرض الكباتن الموافق عليهم مع الحالة، التوفر، الرحلات، والأرباح التقديرية.", "Approved captains with status, availability, ride history, and estimated earnings.")}
        meta={`${filteredDrivers.length} / ${drivers.length}`}
        actions={<Button variant="secondary" onClick={() => exportRowsToCsv("admin-drivers.csv", filteredDrivers, DRIVER_EXPORT_COLUMNS)} disabled={!filteredDrivers.length}>Export CSV</Button>}
      />

      <div className="admin-analytics-strip admin-super-summary">
        <div><span>{textFor(isArabic, "كباتن نشطون", "Active captains")}</span><strong>{activeCount}</strong></div>
        <div><span>{textFor(isArabic, "متاحون الآن", "Available now")}</span><strong>{onlineCount}</strong></div>
        <div><span>{textFor(isArabic, "موقوفون", "Suspended")}</span><strong>{suspendedCount}</strong></div>
      </div>

      <div className="admin-filter-bar advanced-filter-bar">
        <Input label={textFor(isArabic, "بحث", "Search")} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={textFor(isArabic, "الاسم، الهاتف، المركبة أو اللوحة", "Name, phone, vehicle, or plate")} />
        <Select label={textFor(isArabic, "الحالة", "Status")} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">{statusLabel("all", isArabic)}</option>
          <option value="active">{statusLabel("active", isArabic)}</option>
          <option value="suspended">{statusLabel("suspended", isArabic)}</option>
        </Select>
        <Select label={textFor(isArabic, "التوفر", "Availability")} value={onlineFilter} onChange={(event) => setOnlineFilter(event.target.value)}>
          <option value="all">{statusLabel("all", isArabic)}</option>
          <option value="online">{statusLabel("online", isArabic)}</option>
          <option value="offline">{statusLabel("offline", isArabic)}</option>
        </Select>
      </div>

      <DataTable
        className="drivers-table advanced-admin-table"
        gridTemplateColumns="minmax(160px, 1.4fr) minmax(130px, 1fr) minmax(110px, .9fr) minmax(120px, 1fr) minmax(100px, .8fr) minmax(105px, .8fr) minmax(105px, .8fr) minmax(75px, .6fr) minmax(125px, 1fr) minmax(170px, 1.2fr)"
        columns={[
          { key: "name", label: textFor(isArabic, "الاسم", "Name") },
          { key: "phone", label: textFor(isArabic, "الهاتف", "Phone") },
          { key: "city", label: textFor(isArabic, "المدينة", "City") },
          { key: "vehicle", label: textFor(isArabic, "المركبة", "Vehicle") },
          { key: "plate", label: textFor(isArabic, "اللوحة", "Plate") },
          { key: "status", label: textFor(isArabic, "الحالة", "Status") },
          { key: "online", label: textFor(isArabic, "التوفر", "Availability") },
          { key: "rating", label: textFor(isArabic, "التقييم", "Rating") },
          { key: "created", label: textFor(isArabic, "الإنشاء", "Created") },
          { key: "action", label: textFor(isArabic, "إجراءات", "Actions") }
        ]}
        rows={filteredDrivers}
        empty={<EmptyState title={textFor(isArabic, "لا يوجد كباتن مطابقون", "No matching captains")} description={textFor(isArabic, "طلبات الكباتن المقبولة ستظهر هنا.", "Approved captain applications will appear here.")} />}
        renderRow={(driver) => {
          const nextStatus = driver.status === "active" ? "suspended" : "active";
          return (
            <div className="admin-table-row" key={driver.id}>
              <strong>{driver.name}</strong>
              <span>{driver.phone}</span>
              <span>{driver.city}</span>
              <span>{driver.vehicle}</span>
              <span>{driver.plate}</span>
              <Badge className="admin-status-badge-ar" tone={adminStatusTone(driver.status)}>{statusLabel(driver.status, isArabic)}</Badge>
              <Badge className="admin-status-badge-ar" tone={adminStatusTone(driver.onlineStatus)}>{statusLabel(driver.onlineStatus, isArabic)}</Badge>
              <span>{driver.rating}{driver.ratingCount ? ` (${driver.ratingCount})` : ""}</span>
              <span>{formatDate(driver.createdAt, isArabic, { dateOnly: true })}</span>
              <div className="admin-action-row compact-actions">
                <Button variant="secondary" size="sm" onClick={() => setSelectedDriver(driver)}>{textFor(isArabic, "عرض", "View")}</Button>
                <Button variant={nextStatus === "suspended" ? "danger" : "secondary"} size="sm" onClick={() => updateDriverStatus(driver.id, { status: nextStatus })} disabled={adminMutating}>
                  {nextStatus === "suspended" ? textFor(isArabic, "إيقاف", "Suspend") : textFor(isArabic, "تفعيل", "Activate")}
                </Button>
              </div>
            </div>
          );
        }}
      />

      <AdminDetailDrawer
        open={Boolean(selectedDriver)}
        title={selectedDriver?.name || ""}
        subtitle={textFor(isArabic, "تفاصيل الكابتن", "Captain details")}
        status={selectedDriver?.status}
        isArabic={isArabic}
        onClose={() => setSelectedDriver(null)}
        actions={<DrawerCloseButton isArabic={isArabic} onClick={() => setSelectedDriver(null)} />}
      >
        {selectedDriver && (
          <>
            <DetailGrid
              items={[
                { label: textFor(isArabic, "الهاتف", "Phone"), value: selectedDriver.phone },
                { label: textFor(isArabic, "المدينة", "City"), value: selectedDriver.city },
                { label: textFor(isArabic, "المركبة", "Vehicle"), value: selectedDriver.vehicle },
                { label: textFor(isArabic, "اللوحة", "Plate"), value: selectedDriver.plate },
                { label: textFor(isArabic, "الحالة", "Status"), value: statusLabel(selectedDriver.status, isArabic) },
                { label: textFor(isArabic, "التوفر", "Availability"), value: statusLabel(selectedDriver.onlineStatus, isArabic) },
                { label: textFor(isArabic, "آخر تحديث للتوفر", "Availability updated"), value: textFor(isArabic, "غير محفوظ حاليًا - TODO", "Not stored yet - TODO") },
                { label: textFor(isArabic, "متوسط التقييم", "Average rating"), value: selectedDriver.ratingCount ? `${selectedDriver.rating}/5 (${selectedDriver.ratingCount})` : selectedDriver.rating },
                { label: textFor(isArabic, "عدد الرحلات", "Ride count"), value: driverRides(selectedDriver).length || selectedDriver.ridesCount },
                { label: textFor(isArabic, "الأرباح التقريبية", "Estimated earnings"), value: formatMoney(driverRides(selectedDriver).reduce((sum, ride) => sum + Number(ride.fareIls || 0), Number(selectedDriver.earnings || 0))) },
                { label: textFor(isArabic, "تاريخ الإنشاء", "Created at"), value: formatDate(selectedDriver.createdAt, isArabic) }
              ]}
            />
            <DrawerPlaceholder title={textFor(isArabic, "آخر الرحلات", "Recent rides")}>
              {driverRides(selectedDriver).length
                ? driverRides(selectedDriver).map((ride) => `${ride.id}: ${ride.pickup} → ${ride.dropoff} (${statusLabel(ride.status, isArabic)})`).join(" | ")
                : textFor(isArabic, "لا توجد رحلات مرتبطة ظاهرة حاليًا.", "No linked rides are visible right now.")}
            </DrawerPlaceholder>
            <DrawerPlaceholder title={textFor(isArabic, "تذاكر الدعم", "Support tickets")}>
              {driverTickets(selectedDriver).length
                ? driverTickets(selectedDriver).map((ticket) => `${ticket.type}: ${statusLabel(ticket.status, isArabic)}`).join(" | ")
                : textFor(isArabic, "لا توجد تذاكر مرتبطة.", "No linked support tickets.")}
            </DrawerPlaceholder>
          </>
        )}
      </AdminDetailDrawer>
    </section>
  );
}
