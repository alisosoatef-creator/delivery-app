import { useMemo, useState } from "react";
import { useSupportTickets } from "../../hooks/useSupportTickets.js";
import { cityNameById, rideDisplayCode } from "../../utils/rideUtils.js";

const CUSTOMER_SUPPORT_TYPES = [
  { value: "ride_issue", ar: "مشكلة في الرحلة", en: "Ride issue" },
  { value: "payment_issue", ar: "مشكلة في الدفع", en: "Payment issue" },
  { value: "captain_issue", ar: "مشكلة مع الكابتن", en: "Captain issue" },
  { value: "account_issue", ar: "مشكلة في الحساب", en: "Account issue" },
  { value: "feedback", ar: "اقتراح أو ملاحظة", en: "Suggestion or note" },
  { value: "other", ar: "أخرى", en: "Other" }
];

function formatDate(value, isArabic) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(isArabic ? "ar" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function supportTypeLabel(type, isArabic) {
  const match = CUSTOMER_SUPPORT_TYPES.find((item) => item.value === type);
  return match ? (isArabic ? match.ar : match.en) : type;
}

export function CustomerSupportPanel({ state, dispatch, isArabic, setActiveView }) {
  const user = state.currentUser || state.session || {};
  const phone = user.phone || state.phone || "";
  const name = user.fullName || user.name || (isArabic ? "زبون وصل" : "Wasel customer");
  const cityName = cityNameById(state.cities, state.cityId, isArabic);
  const supportQuery = useSupportTickets({ enabled: Boolean(state.session), phone, role: "customer" });
  const rideOptions = useMemo(() => {
    const rides = [state.ride, ...(state.customerRides || [])].filter(Boolean);
    const seen = new Set();
    return rides.filter((ride) => {
      if (!ride?.id || seen.has(ride.id)) return false;
      seen.add(ride.id);
      return true;
    });
  }, [state.customerRides, state.ride]);
  const [form, setForm] = useState({ type: "ride_issue", message: "", rideId: "" });

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitTicket(event) {
    event.preventDefault();
    if (!form.message.trim()) {
      dispatch({ type: "toast", message: isArabic ? "اكتب تفاصيل المشكلة قبل إرسال التذكرة." : "Write the issue details before sending." });
      return;
    }

    try {
      await supportQuery.createTicket({
        name,
        phone,
        role: "customer",
        type: form.type,
        message: form.message.trim(),
        rideId: form.rideId
      });
      setForm({ type: "ride_issue", message: "", rideId: "" });
      dispatch({ type: "toast", message: isArabic ? "تم إرسال تذكرة الدعم بنجاح." : "Support ticket sent successfully." });
    } catch {
      dispatch({ type: "toast", message: isArabic ? "تعذر إرسال التذكرة. تأكد أن السيرفر يعمل ثم حاول مرة أخرى." : "Could not send the ticket. Make sure the backend is running." });
    }
  }

  return (
    <div className="account-card customer-support-card support-system-card">
      <div className="support-hero">
        <span>{isArabic ? "مركز الدعم" : "Support center"}</span>
        <h3>{isArabic ? "أرسل تذكرة دعم وتابع حالتها" : "Send a support ticket and track it"}</h3>
        <p>{isArabic ? `خدمتك الحالية في ${cityName}. اربط التذكرة برحلة عند الحاجة حتى تصل للفريق بشكل أوضح.` : `Your current service city is ${cityName}. Link a ride when it helps the team understand the issue.`}</p>
      </div>

      <form className="support-ticket-form" onSubmit={submitTicket}>
        <label className="field">
          <span>{isArabic ? "نوع المشكلة" : "Issue type"}</span>
          <select value={form.type} onChange={(event) => updateForm("type", event.target.value)}>
            {CUSTOMER_SUPPORT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{isArabic ? type.ar : type.en}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{isArabic ? "رحلة مرتبطة - اختياري" : "Linked ride - optional"}</span>
          <select value={form.rideId} onChange={(event) => updateForm("rideId", event.target.value)}>
            <option value="">{isArabic ? "بدون رحلة" : "No linked ride"}</option>
            {rideOptions.map((ride) => (
              <option key={ride.id} value={ride.id}>{rideDisplayCode(ride)} - {ride.pickup || "-"} / {ride.dropoff || ride.destination || "-"}</option>
            ))}
          </select>
        </label>
        <label className="field support-message-field">
          <span>{isArabic ? "الرسالة" : "Message"}</span>
          <textarea value={form.message} onChange={(event) => updateForm("message", event.target.value)} rows={5} placeholder={isArabic ? "اكتب ما حدث بوضوح..." : "Tell us what happened..."} />
        </label>
        <div className="account-action-row">
          <button className="primary" type="submit" disabled={supportQuery.isCreating}>
            {supportQuery.isCreating ? (isArabic ? "جار الإرسال..." : "Sending...") : (isArabic ? "إرسال تذكرة" : "Send ticket")}
          </button>
          <button className="secondary" type="button" onClick={() => setActiveView("ride")}>
            {isArabic ? "العودة للمشوار" : "Back to ride"}
          </button>
        </div>
      </form>

      <section className="support-ticket-list">
        <div className="panel-title">
          <div>
            <span>{isArabic ? "تذاكري" : "My tickets"}</span>
            <h3>{isArabic ? "الطلبات السابقة" : "Previous requests"}</h3>
          </div>
          <button className="secondary" type="button" onClick={() => supportQuery.refetchTickets()} disabled={supportQuery.isLoading}>
            {isArabic ? "تحديث" : "Refresh"}
          </button>
        </div>
        {supportQuery.isLoading && <p className="support-ticket-empty">{isArabic ? "جار تحميل التذاكر..." : "Loading tickets..."}</p>}
        {supportQuery.backendError && <p className="support-ticket-error">{isArabic ? "تعذر تحميل التذاكر من السيرفر." : "Unable to load tickets from the backend."}</p>}
        {!supportQuery.isLoading && !supportQuery.tickets.length && (
          <p className="support-ticket-empty">{isArabic ? "لا توجد تذاكر دعم بعد." : "No support tickets yet."}</p>
        )}
        {supportQuery.tickets.map((ticket) => (
          <article className="support-ticket-card" key={ticket.id}>
            <div>
              <strong>{supportTypeLabel(ticket.type, isArabic)}</strong>
              <p>{ticket.message}</p>
              {ticket.rideId && <small>{isArabic ? "رحلة مرتبطة" : "Linked ride"}: {ticket.rideId}</small>}
            </div>
            <span className={`admin-badge ${ticket.status}`}>{ticket.status}</span>
            <small>{formatDate(ticket.createdAt, isArabic)}</small>
          </article>
        ))}
      </section>
    </div>
  );
}
