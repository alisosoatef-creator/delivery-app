import { useEffect, useState } from "react";
import { Field, QuoteStrip } from "../../components/ui/index.js";
import { searchPlaces } from "../../services/placesApi.js";
import { formatCardExpiryInput, formatCardNumberInput, maskCardNumber } from "../../utils/paymentUtils.js";

export function RouteSearchCard({ state, dispatch, t, isArabic, actionLabel, onAction }) {
  const [destinationQuery, setDestinationQuery] = useState("");
  const [placeResults, setPlaceResults] = useState([]);
  const [placeSearchStatus, setPlaceSearchStatus] = useState("idle");
  const [cardDraft, setCardDraft] = useState({
    cardHolderName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    saveVisaCardDemo: false
  });

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setPlaceSearchStatus("loading");
      searchPlaces({ city: state.cityId, q: destinationQuery })
        .then((places) => {
          if (cancelled) return;
          setPlaceResults(places);
          setPlaceSearchStatus("ready");
        })
        .catch(() => {
          if (cancelled) return;
          setPlaceResults([]);
          setPlaceSearchStatus("error");
        });
    }, destinationQuery.trim() ? 220 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [destinationQuery, state.cityId]);

  function updateCardDraft(field, value) {
    setCardDraft((draft) => ({
      ...draft,
      [field]:
        field === "cardNumber"
          ? formatCardNumberInput(value)
          : field === "cardExpiry"
            ? formatCardExpiryInput(value)
            : field === "cardCvv"
              ? value.replace(/\D/g, "").slice(0, 4)
              : value
    }));
  }

  function handleVisaCardSubmit(event) {
    event.preventDefault();
    const cardDigits = cardDraft.cardNumber.replace(/\D/g, "");
    const hasValidDemoCard =
      cardDraft.cardHolderName.trim().length >= 2 &&
      cardDigits.length >= 12 &&
      cardDraft.cardExpiry.length === 5 &&
      cardDraft.cardCvv.length >= 3;

    if (!hasValidDemoCard) {
      dispatch({
        type: "toast",
        message: isArabic ? "أكمل بيانات بطاقة VISA التجريبية أولًا." : "Complete the demo VISA card details first."
      });
      return;
    }

    dispatch({
      type: "patch",
      patch: {
        visaCardReady: true,
        visaCardPreview: maskCardNumber(cardDraft.cardNumber),
        saveVisaCardDemo: cardDraft.saveVisaCardDemo,
        toast: isArabic ? "تم اختيار بطاقة VISA للتجربة فقط." : "Demo VISA card selected."
      }
    });
  }

  function handleSelectDestination(place) {
    const point = { lat: Number(place.lat), lng: Number(place.lng) };
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;
    setDestinationQuery(place.label);
    dispatch({
      type: "patch",
      patch: {
        dropoff: `${place.label} - ${place.city}`,
        destinationLocation: point,
        routeInfo: null,
        routeStatus: state.pickupLocation ? "loading" : "idle",
        routeError: "",
        toast: isArabic ? "تم تحديد الوجهة على الخريطة." : "Destination selected on the map."
      }
    });
  }

  function handleUsePlaceAsPickup(place) {
    const point = { lat: Number(place.lat), lng: Number(place.lng) };
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;
    dispatch({
      type: "patch",
      patch: {
        pickup: `${place.label} - ${place.city}`,
        pickupLocation: point,
        customerLocation: point,
        routeInfo: null,
        routeStatus: state.destinationLocation ? "loading" : "idle",
        routeError: "",
        locationStatus: "manual"
      }
    });
  }

  return (
    <div className="route-search-card">
      <div className="route-search-head">
        <span>{isArabic ? "حجز مشوار" : "Book a ride"}</span>
        <strong>{isArabic ? "من / إلى" : "From / To"}</strong>
      </div>
      <div className="ride-step-hint">
        <span>{isArabic ? "1. اختر المدينة" : "1. Choose city"}</span>
        <span>{isArabic ? "2. استخدم موقعي الحالي" : "2. Use my location"}</span>
        <span>{isArabic ? "3. ابحث عن وجهتك" : "3. Search destination"}</span>
        <span>{isArabic ? "4. اطلب الرحلة" : "4. Request ride"}</span>
      </div>
      <div className="route-fields">
        <Field
          label={isArabic ? "From / من" : "From"}
          value={state.pickup}
          onChange={(pickup) => dispatch({ type: "patch", patch: { pickup } })}
        />
        <Field
          label={isArabic ? "To / إلى" : "To"}
          value={state.dropoff}
          onChange={(dropoff) => dispatch({ type: "patch", patch: { dropoff } })}
        />
      </div>
      <div className="location-search-panel destination-location-search">
        <label className="field location-search-field">
          <span>{isArabic ? "إلى أين تريد الذهاب؟" : "Where do you want to go?"}</span>
          <input
            value={destinationQuery}
            onChange={(event) => setDestinationQuery(event.target.value)}
            placeholder={isArabic ? "ابحث عن جامعة، حي، دوار..." : "Search a university, district, landmark..."}
            autoComplete="off"
          />
        </label>
        <div className="location-search-results">
          {placeSearchStatus === "loading" && <small>{isArabic ? "جاري البحث عن أماكن قريبة..." : "Searching nearby places..."}</small>}
          {placeSearchStatus === "error" && <small>{isArabic ? "تعذر البحث الآن، استخدم النتائج المحلية أو الخريطة." : "Search failed; use local results or the map."}</small>}
          {placeResults.map((place) => (
            <div className="location-result-card" key={place.id}>
              <span>
                <strong>{place.label}</strong>
                <small>{place.category} · {place.city}</small>
              </span>
              <button type="button" onClick={() => handleSelectDestination(place)}>{isArabic ? "اختيار الوجهة" : "Select"}</button>
              <button type="button" className="ghost" onClick={() => handleUsePlaceAsPickup(place)}>
                {isArabic ? "كنقطة انطلاق" : "As pickup"}
              </button>
            </div>
          ))}
          {!placeResults.length && placeSearchStatus === "ready" && (
            <small>{isArabic ? "لا توجد نتائج قريبة. يمكنك كتابة الوجهة يدويًا أو اختيار نقطة متقدمة من الخريطة." : "No nearby results. You can type manually or use the map as an advanced option."}</small>
          )}
        </div>
      </div>
      <div className="route-options-row">
        <label className="field city-field">
          <span>{t.city}</span>
          <select value={state.cityId} onChange={(event) => dispatch({ type: "patch", patch: { cityId: event.target.value } })}>
            {state.cities.map((city) => (
              <option key={city.id} value={city.id}>
                {isArabic ? city.ar : city.en}
              </option>
            ))}
          </select>
        </label>
        <div className="segmented payment-choice-tabs" aria-label={t.payment}>
          <button
            className={state.paymentMethod === "cash" ? "active" : ""}
            type="button"
            aria-pressed={state.paymentMethod === "cash"}
            onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "cash" } })}
          >
            {t.cash}
          </button>
          <button
            className={state.paymentMethod === "visa" ? "active" : ""}
            type="button"
            aria-pressed={state.paymentMethod === "visa"}
            onClick={() => dispatch({ type: "patch", patch: { paymentMethod: "visa" } })}
          >
            {t.visa}
          </button>
        </div>
      </div>
      {state.paymentMethod === "visa" && (
        <form className="visa-payment-panel visa-card-form" onSubmit={handleVisaCardSubmit}>
          <div className="payment-card-preview" aria-hidden="true">
            <span>VISA</span>
            <strong>{state.visaCardPreview || "•••• •••• •••• 4582"}</strong>
            <small>{cardDraft.cardHolderName || (isArabic ? "اسم صاحب البطاقة" : "CARD HOLDER")}</small>
          </div>
          <div className="visa-field-grid">
            <label className="field">
              <span>{isArabic ? "اسم صاحب البطاقة" : "Cardholder name"}</span>
              <input
                autoComplete="off"
                name="cardHolderName"
                value={cardDraft.cardHolderName}
                onChange={(event) => updateCardDraft("cardHolderName", event.target.value)}
                placeholder={isArabic ? "مثال: Ahmad Naser" : "Example: Ahmad Naser"}
              />
            </label>
            <label className="field">
              <span>{isArabic ? "رقم البطاقة" : "Card number"}</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                name="cardNumber"
                value={cardDraft.cardNumber}
                onChange={(event) => updateCardDraft("cardNumber", event.target.value)}
                placeholder="4242 4242 4242 4242"
              />
            </label>
            <label className="field">
              <span>{isArabic ? "تاريخ الانتهاء" : "Expiry"}</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                name="cardExpiry"
                value={cardDraft.cardExpiry}
                onChange={(event) => updateCardDraft("cardExpiry", event.target.value)}
                placeholder="MM/YY"
              />
            </label>
            <label className="field">
              <span>CVV</span>
              <input
                autoComplete="off"
                inputMode="numeric"
                name="cardCvv"
                type="password"
                value={cardDraft.cardCvv}
                onChange={(event) => updateCardDraft("cardCvv", event.target.value)}
                placeholder="123"
              />
            </label>
          </div>
          <label className="save-card-toggle">
            <input
              checked={cardDraft.saveVisaCardDemo}
              name="saveVisaCardDemo"
              type="checkbox"
              onChange={(event) => updateCardDraft("saveVisaCardDemo", event.target.checked)}
            />
            <span>{isArabic ? "حفظ البطاقة للتجربة فقط" : "Save card for demo only"}</span>
          </label>
          <p className="secure-payment-note">
            {isArabic
              ? "الدفع الإلكتروني تجريبي حاليًا ولا يتم تنفيذ أي عملية دفع أو حفظ بيانات البطاقة في الخادم."
              : "Online payment is a safe placeholder. No real charge is made and card details are not stored on the backend."}
          </p>
          <button className="primary use-demo-visa-card" type="submit">
            {isArabic ? "استخدام هذه البطاقة" : "Use this card"}
          </button>
        </form>
      )}
      <QuoteStrip state={state} t={t} />
      {state.rideRequestError && (
        <p className="route-request-error">{isArabic ? "تعذر إنشاء الرحلة عبر السيرفر. حاول مرة أخرى." : state.rideRequestError}</p>
      )}
      <button className="primary ride-cta" onClick={onAction} disabled={state.rideRequestStatus === "loading"}>
        {state.rideRequestStatus === "loading" ? (isArabic ? "جاري إرسال الطلب..." : "Sending request...") : actionLabel}
      </button>
    </div>
  );
}
