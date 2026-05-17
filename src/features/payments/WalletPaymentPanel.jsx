import { PanelTitle } from "../../components/ui/index.js";

export function WalletPaymentPanel({ state, dispatch, t, isArabic, rideHistory }) {
  const visibleSpend = rideHistory.reduce((sum, ride) => sum + Number(ride.fareIls || 0), 0);
  const paymentRows = rideHistory.slice(0, 4);

  return (
    <div className="account-card wallet-card-shell">
      <PanelTitle title={isArabic ? "المحفظة والدفع" : "Wallet and payment"} meta={isArabic ? "إدارة الدفع" : "Payment settings"} />
      <div className="wallet-card-visual">
        <div>
          <span>{isArabic ? "Wasel Wallet" : "Wasel Wallet"}</span>
          <strong>{isArabic ? "محفظة واصل" : "Wasel wallet"}</strong>
          <small>{isArabic ? "راجع رصيدك وطريقة الدفع المفضلة" : "Review your balance and preferred payment method"}</small>
        </div>
        <b>{visibleSpend} ₪</b>
      </div>

      <div className="payment-methods">
        <button
          className={state.paymentMethod === "cash" ? "selected" : ""}
          onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "cash" } })}
        >
          <span>{isArabic ? "كاش" : "Cash"}</span>
          <small>{isArabic ? "الدفع عند نهاية الرحلة" : "Pay after the ride"}</small>
        </button>
        <button
          className={state.paymentMethod === "visa" ? "selected" : ""}
          onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "visa" } })}
        >
          <span>VISA</span>
          <small>{isArabic ? "واجهة بطاقة تجريبية بدون دفع فعلي" : "Demo card interface without real payment"}</small>
        </button>
      </div>

      <div className="payment-activity">
        <div className="section-mini-title">
          <strong>{isArabic ? "سجل عمليات الدفع" : "Payment activity"}</strong>
          <small>{paymentRows.length ? (isArabic ? "حسب رحلاتك" : "Based on your trips") : (isArabic ? "لا توجد عمليات" : "No activity")}</small>
        </div>
        {paymentRows.length ? (
          paymentRows.map((ride) => (
            <div className="payment-row" key={ride.id}>
              <span>
                <strong>{ride.code}</strong>
                <small>{ride.dateLabel} · {ride.paymentLabel}</small>
              </span>
              <b>{ride.fareIls} ₪</b>
            </div>
          ))
        ) : (
          <div className="detail-empty compact">{isArabic ? "ستظهر عمليات الدفع بعد إنشاء الرحلات" : "Payment records will appear after rides exist"}</div>
        )}
      </div>
    </div>
  );
}
