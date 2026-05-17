import { cityNameById } from "../../utils/rideUtils.js";

export function CustomerSupportPanel({ state, dispatch, isArabic, setActiveView }) {
  const cityName = cityNameById(state.cities, state.cityId, isArabic);
  const supportActions = isArabic
    ? [
        { title: "المساعدة والدعم", text: "تواصل معنا بخصوص أي مشكلة في المشوار أو الحساب." },
        { title: "تواصل مع الإدارة", text: "أرسل طلب متابعة وسيتم التعامل معه حسب الأولوية." },
        { title: "مشكلة في الدفع؟", text: "راجع طريقة الدفع أو المحفظة من قسم الدفع." }
      ]
    : [
        { title: "Help and support", text: "Reach us about any trip or account issue." },
        { title: "Contact management", text: "Send a follow-up request and it will be handled by priority." },
        { title: "Payment issue?", text: "Review payment method or wallet from the payment section." }
      ];

  function notify(title) {
    dispatch({
      type: "toast",
      message: isArabic ? `${title}: تم تسجيل طلبك وسيتابع معك الفريق.` : `${title}: your request was noted for follow-up.`
    });
  }

  return (
    <div className="account-card customer-support-card">
      <div className="support-hero">
        <span>{isArabic ? "مركز الدعم" : "Support center"}</span>
        <h3>{isArabic ? "نحن هنا لمساعدتك" : "We are here to help"}</h3>
        <p>{isArabic ? `خدمتك الحالية في ${cityName}. اختر نوع المساعدة المطلوبة.` : `Your current service city is ${cityName}. Choose the help you need.`}</p>
      </div>
      <div className="support-action-grid">
        {supportActions.map((item) => (
          <button className="support-action-card" type="button" key={item.title} onClick={() => notify(item.title)}>
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
      <div className="account-action-row">
        <button className="secondary" onClick={() => setActiveView("ride")}>
          {isArabic ? "العودة لطلب مشوار" : "Back to ride request"}
        </button>
        <button className="secondary" onClick={() => setActiveView("wallet")}>
          {isArabic ? "المحفظة والدفع" : "Wallet and payment"}
        </button>
      </div>
    </div>
  );
}
