import { Badge, Button, ModalDrawer } from "../../components/ui/index.js";
import { formatDate, statusLabel, textFor } from "./adminFormatters.js";

export function AdminDetailDrawer({ open, title, subtitle, status, isArabic, onClose, children, actions }) {
  return (
    <ModalDrawer open={open} title={title} onClose={onClose} className="admin-advanced-drawer">
      <div className="admin-drawer-hero">
        <div>
          {subtitle && <span>{subtitle}</span>}
          <strong>{title}</strong>
        </div>
        {status && <Badge tone={statusTone(status)}>{statusLabel(status, isArabic)}</Badge>}
      </div>
      {children}
      {actions && <footer className="admin-drawer-actions">{actions}</footer>}
    </ModalDrawer>
  );
}

export function DetailGrid({ items }) {
  return (
    <dl className="admin-detail-grid">
      {items.filter(Boolean).map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AdminTimeline({ status, timestamps = {}, isArabic }) {
  const steps = [
    ["searching", textFor(isArabic, "جاري البحث", "Searching"), timestamps.createdAt],
    ["accepted", textFor(isArabic, "تم القبول", "Accepted"), timestamps.acceptedAt],
    ["driver_arriving", textFor(isArabic, "الكابتن بالطريق", "Driver arriving"), timestamps.driverArrivingAt],
    ["arrived", textFor(isArabic, "وصل الكابتن", "Arrived"), timestamps.arrivedAt],
    ["in_progress", textFor(isArabic, "بدأت الرحلة", "In progress"), timestamps.inProgressAt],
    [status === "cancelled" ? "cancelled" : "completed", status === "cancelled" ? textFor(isArabic, "ملغاة", "Cancelled") : textFor(isArabic, "مكتملة", "Completed"), timestamps.cancelledAt || timestamps.completedAt]
  ];
  const activeIndex = Math.max(0, steps.findIndex(([step]) => step === status));

  return (
    <div className="admin-timeline" aria-label={textFor(isArabic, "تسلسل حالة الرحلة", "Ride status timeline")}>
      {steps.map(([step, label, time], index) => (
        <div className={`admin-timeline-step ${index <= activeIndex ? "is-done" : ""} ${step === status ? "is-current" : ""}`} key={`${step}-${index}`}>
          <span />
          <div>
            <strong>{label}</strong>
            <small>{formatDate(time, isArabic)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DrawerPlaceholder({ title, children }) {
  return (
    <div className="admin-drawer-placeholder">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

export function DrawerCloseButton({ isArabic, onClick }) {
  return (
    <Button variant="secondary" onClick={onClick}>
      {textFor(isArabic, "إغلاق", "Close")}
    </Button>
  );
}

function statusTone(status) {
  if (["active", "approved", "completed", "paid", "open", "online"].includes(status)) return "success";
  if (["pending", "searching", "accepted", "driver_arriving", "arrived", "in_progress"].includes(status)) return "warning";
  if (["cancelled", "rejected", "suspended", "failed", "closed", "offline"].includes(status)) return "danger";
  return "neutral";
}
