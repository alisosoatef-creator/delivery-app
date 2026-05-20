import { useState } from "react";
import { PanelTitle, StatusBadge } from "../../components/ui/index.js";
import { usePayments } from "../../hooks/usePayments.js";
import { formatCardExpiryInput, formatCardNumberInput, maskCardNumber } from "../../utils/paymentUtils.js";

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

function paymentMethodName(method, isArabic) {
  if (method === "visa") return isArabic ? "VISA تجريبي" : "VISA demo";
  if (method === "wallet") return isArabic ? "المحفظة" : "Wallet";
  return isArabic ? "كاش" : "Cash";
}

export function WalletPaymentPanel({ state, dispatch, t, isArabic, rideHistory }) {
  const userId = state.currentUser?.id || state.session?.id || "";
  const phone = state.currentUser?.phone || state.session?.phone || state.phone || "";
  const payments = usePayments({ enabled: Boolean(state.session), userId, phone, role: "customer" });
  const [cardDraft, setCardDraft] = useState({
    cardholderName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const walletBalance = payments.wallet.balanceIls ?? payments.wallet.balance ?? 0;
  const paymentRows = payments.customerPayments.length
    ? payments.customerPayments
    : rideHistory.slice(0, 4).map((ride) => ({
      id: `local_${ride.id}`,
      rideId: ride.id,
      method: ride.paymentMethod || "cash",
      amountIls: ride.fareIls || 0,
      status: ride.status === "completed" ? "paid" : "pending",
      createdAt: ride.createdAt || ride.dateLabel
    }));

  function updateCardDraft(field, value) {
    setCardDraft((draft) => ({
      ...draft,
      [field]:
        field === "cardNumber"
          ? formatCardNumberInput(value)
          : field === "expiry"
            ? formatCardExpiryInput(value)
            : field === "cvv"
              ? value.replace(/\D/g, "").slice(0, 4)
              : value
    }));
  }

  async function saveVisaPlaceholder(event) {
    event.preventDefault();
    const digits = cardDraft.cardNumber.replace(/\D/g, "");
    const [expiryMonth = "", expiryYear = ""] = cardDraft.expiry.split("/");
    if (!cardDraft.cardholderName.trim() || digits.length < 12 || cardDraft.expiry.length !== 5) {
      dispatch({
        type: "toast",
        message: isArabic ? "أكمل بيانات البطاقة التجريبية قبل الحفظ." : "Complete the demo card details before saving."
      });
      return;
    }

    try {
      await payments.addPaymentMethod({
        userId,
        userPhone: phone,
        type: "visa",
        cardholderName: cardDraft.cardholderName.trim(),
        last4: digits.slice(-4),
        brand: "VISA",
        expiryMonth,
        expiryYear: expiryYear ? `20${expiryYear}` : ""
      });
      setCardDraft({ cardholderName: "", cardNumber: "", expiry: "", cvv: "" });
      dispatch({
        type: "toast",
        message: isArabic ? "تم حفظ بطاقة VISA التجريبية بدون رقم كامل أو CVV." : "Demo VISA saved without full card number or CVV."
      });
    } catch {
      dispatch({
        type: "toast",
        message: isArabic ? "تعذر حفظ بطاقة VISA التجريبية. تأكد أن السيرفر يعمل." : "Unable to save the demo VISA card. Make sure the backend is running."
      });
    }
  }

  return (
    <div className="account-card wallet-card-shell">
      <PanelTitle title={isArabic ? "المحفظة والدفع" : "Wallet and payment"} meta={isArabic ? "كاش وVISA تجريبي" : "Cash and demo VISA"} />
      {payments.backendError && (
        <p className="payment-error-note">
          {isArabic ? "تعذر الاتصال بنظام الدفع الآن. ستبقى الرحلات تعمل، ويمكن إعادة التحديث لاحقًا." : "Payment APIs are unavailable right now. Rides still work and you can refresh later."}
        </p>
      )}
      <div className="wallet-card-visual">
        <div>
          <span>Wasel Wallet</span>
          <strong>{isArabic ? "رصيد المحفظة" : "Wallet balance"}</strong>
          <small>{isArabic ? "رصيد تطوير محلي بدون شحن حقيقي" : "Local development balance without real top-up"}</small>
        </div>
        <b>{walletBalance} ₪</b>
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
          <small>{isArabic ? "واجهة تجريبية بدون دفع حقيقي" : "Demo interface without real payment"}</small>
        </button>
      </div>

      <section className="wallet-saved-methods">
        <div className="section-mini-title">
          <strong>{isArabic ? "طرق الدفع المحفوظة" : "Saved payment methods"}</strong>
          <small>{isArabic ? "لا يتم حفظ رقم البطاقة الكامل أو CVV" : "Full card numbers and CVV are never stored"}</small>
        </div>
        {payments.paymentMethods.length ? (
          payments.paymentMethods.map((method) => (
            <div className="payment-row wallet-method-row" key={method.id}>
              <span>
                <strong>{method.brand || "VISA"} {maskCardNumber(method.last4)}</strong>
                <small>{method.cardholderName || "-"} · {method.expiryMonth}/{String(method.expiryYear || "").slice(-2)}</small>
              </span>
              <button className="secondary danger-soft" type="button" onClick={() => payments.deletePaymentMethod(method.id)} disabled={payments.isMutating}>
                {isArabic ? "حذف" : "Delete"}
              </button>
            </div>
          ))
        ) : (
          <div className="detail-empty compact">{isArabic ? "لا توجد بطاقات محفوظة بعد." : "No saved cards yet."}</div>
        )}
      </section>

      <form className="wallet-visa-form" onSubmit={saveVisaPlaceholder}>
        <div className="section-mini-title">
          <strong>{isArabic ? "إضافة VISA تجريبية" : "Add demo VISA"}</strong>
          <small>{isArabic ? "تجريبي / غير مفعل حاليًا" : "Demo / not active for real payments"}</small>
        </div>
        <div className="visa-field-grid">
          <label className="field">
            <span>{isArabic ? "اسم صاحب البطاقة" : "Cardholder name"}</span>
            <input value={cardDraft.cardholderName} onChange={(event) => updateCardDraft("cardholderName", event.target.value)} placeholder="Ahmad Naser" />
          </label>
          <label className="field">
            <span>{isArabic ? "رقم البطاقة" : "Card number"}</span>
            <input inputMode="numeric" value={cardDraft.cardNumber} onChange={(event) => updateCardDraft("cardNumber", event.target.value)} placeholder="4242 4242 4242 4242" />
          </label>
          <label className="field">
            <span>{isArabic ? "تاريخ الانتهاء" : "Expiry"}</span>
            <input inputMode="numeric" value={cardDraft.expiry} onChange={(event) => updateCardDraft("expiry", event.target.value)} placeholder="MM/YY" />
          </label>
          <label className="field">
            <span>CVV</span>
            <input inputMode="numeric" type="password" value={cardDraft.cvv} onChange={(event) => updateCardDraft("cvv", event.target.value)} placeholder="123" />
          </label>
        </div>
        <p className="secure-payment-note">
          {isArabic
            ? "CVV يستخدم للتحقق من النموذج فقط ولا يرسل للتخزين. يتم إرسال آخر 4 أرقام فقط."
            : "CVV is only used for form validation and is not sent for storage. Only last4 is saved."}
        </p>
        <button className="primary" type="submit" disabled={payments.isMutating || !phone}>
          {payments.isMutating ? (isArabic ? "جار الحفظ..." : "Saving...") : (isArabic ? "حفظ البطاقة التجريبية" : "Save demo card")}
        </button>
      </form>

      <div className="payment-activity">
        <div className="section-mini-title">
          <strong>{isArabic ? "سجل عمليات الدفع" : "Payment activity"}</strong>
          <small>{payments.isLoading ? (isArabic ? "تحميل" : "Loading") : paymentRows.length ? (isArabic ? "من قاعدة البيانات" : "From database") : (isArabic ? "لا توجد عمليات" : "No activity")}</small>
        </div>
        {paymentRows.length ? (
          paymentRows.map((payment) => (
            <div className="payment-row" key={payment.id}>
              <span>
                <strong>{payment.rideId || payment.id}</strong>
                <small>{formatDate(payment.createdAt, isArabic)} · {paymentMethodName(payment.method, isArabic)}</small>
              </span>
              <StatusBadge status={payment.status} label={payment.status} />
              <b>{payment.amountIls ?? payment.amount ?? 0} ₪</b>
            </div>
          ))
        ) : (
          <div className="detail-empty compact">{isArabic ? "ستظهر عمليات الدفع بعد إنشاء الرحلات أو الدفع التجريبي." : "Payment records will appear after rides or demo payments exist."}</div>
        )}
      </div>
    </div>
  );
}
