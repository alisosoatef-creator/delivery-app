import { Avatar, StatusBadge } from "../../components/ui/index.js";
import { cityNameById, paymentMethodLabel } from "../../utils/rideUtils.js";

export function AccountProfilePanel({ state, dispatch, t, isArabic, rideHistory, selectedDriver }) {
  const phone = state.session?.phone || state.phone;
  const cityName = cityNameById(state.cities, state.cityId, isArabic);
  const completedRides = rideHistory.filter((ride) => ride.statusGroup === "completed").length;
  const activeRides = rideHistory.filter((ride) => ride.statusGroup === "active").length;
  const totalSpent = rideHistory.reduce((sum, ride) => sum + Number(ride.fareIls || 0), 0);
  const userName = isArabic ? "عميل واصل" : "Wasel rider";
  const rating = selectedDriver?.rating || "4.9";

  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  return (
    <div className="account-card profile-card">
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <Avatar label={userName.slice(0, 1)} />
          <span />
        </div>
        <div>
          <span>{isArabic ? "حساب المستخدم" : "User profile"}</span>
          <h3>{userName}</h3>
          <p>{phone}</p>
        </div>
        <StatusBadge status="accepted" label={isArabic ? "نشط" : "Active"} />
      </div>

      <div className="profile-info-grid">
        <span>
          <small>{t.city}</small>
          <strong>{cityName}</strong>
        </span>
        <span>
          <small>{isArabic ? "نوع الحساب" : "Account type"}</small>
          <strong>{t.customer}</strong>
        </span>
        <span>
          <small>{isArabic ? "طريقة الدفع" : "Payment"}</small>
          <strong>{paymentMethodLabel(state.paymentMethod, isArabic)}</strong>
        </span>
      </div>

      <div className="account-stats-grid">
        <span><small>{isArabic ? "كل الرحلات" : "All rides"}</small><strong>{rideHistory.length}</strong></span>
        <span><small>{isArabic ? "مكتملة" : "Completed"}</small><strong>{completedRides}</strong></span>
        <span><small>{isArabic ? "قيد التنفيذ" : "Active"}</small><strong>{activeRides}</strong></span>
        <span><small>{isArabic ? "إجمالي المدفوعات" : "Total spend"}</small><strong>{totalSpent} ₪</strong></span>
        <span><small>{isArabic ? "تقييم الخدمة" : "Service rating"}</small><strong>{rating}</strong></span>
      </div>

      <div className="account-action-row">
        <button className="secondary" onClick={() => notify("يمكنك تحديث بيانات الحساب من الإعدادات عند توفر التعديل.", "You can update account details from settings when editing is available.")}>
          {isArabic ? "تعديل الحساب" : "Edit profile"}
        </button>
      </div>
    </div>
  );
}
