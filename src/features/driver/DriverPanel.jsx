import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Avatar, Metric, PanelTitle, StatusBadge } from "../../components/ui/index.js";
import { useDriverData } from "../../hooks/useDriverData.js";
import { usePayments } from "../../hooks/usePayments.js";
import { useSupportTickets } from "../../hooks/useSupportTickets.js";
import { sendDriverLocationUnavailable, sendDriverLocationUpdate } from "../../services/socketClient.js";
import { statusText } from "../../utils/i18n.js";
import { RIDE_STATUSES } from "../../utils/rideStatus.js";
import { cityNameById, paymentMethodLabel, rideDisplayCode } from "../../utils/rideUtils.js";

const MapBoard = lazy(() => import("../rides/MapBoard.jsx").then((module) => ({ default: module.MapBoard })));

const ACTIVE_DRIVER_RIDE_STATUSES = [
  RIDE_STATUSES.accepted,
  RIDE_STATUSES.driverArriving,
  RIDE_STATUSES.arrived,
  RIDE_STATUSES.inProgress
];

const DRIVER_STATUS_ACTIONS = [
  { from: RIDE_STATUSES.accepted, next: RIDE_STATUSES.driverArriving, labelAr: "أنا بالطريق", labelEn: "I'm on the way" },
  { from: RIDE_STATUSES.driverArriving, next: RIDE_STATUSES.arrived, labelAr: "وصلت", labelEn: "Arrived" },
  { from: RIDE_STATUSES.arrived, next: RIDE_STATUSES.inProgress, labelAr: "بدأت الرحلة", labelEn: "Start ride" },
  { from: RIDE_STATUSES.inProgress, next: RIDE_STATUSES.completed, labelAr: "إنهاء الرحلة", labelEn: "Complete ride" }
];

const DRIVER_SUPPORT_TYPES = [
  { value: "customer_issue", ar: "مشكلة مع زبون", en: "Customer issue" },
  { value: "ride_issue", ar: "مشكلة في رحلة", en: "Ride issue" },
  { value: "earnings_issue", ar: "مشكلة في الأرباح", en: "Earnings issue" },
  { value: "account_issue", ar: "مشكلة في الحساب", en: "Account issue" },
  { value: "gps_issue", ar: "مشكلة في GPS", en: "GPS issue" },
  { value: "other", ar: "أخرى", en: "Other" }
];

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

function normalizeDriverRide(ride, state, isArabic) {
  const status = ride.status || RIDE_STATUSES.searching;
  const cityName = cityNameById(state.cities, ride.cityId || ride.city || state.cityId, isArabic);
  return {
    ...ride,
    code: rideDisplayCode(ride),
    pickup: ride.pickup || (isArabic ? `مركز ${cityName}` : `${cityName} center`),
    dropoff: ride.dropoff || ride.destination || (isArabic ? `وجهة داخل ${cityName}` : `${cityName} destination`),
    fareIls: ride.fareIls || ride.price || 0,
    distanceKm: ride.routeDistanceKm || ride.distanceKm || 0,
    etaMinutes: ride.durationMinutes || ride.etaMinutes || "-",
    paymentLabel: paymentMethodLabel(ride.paymentMethod || state.paymentMethod || "cash", isArabic),
    status,
    statusLabel: statusText[state.language][status] || status,
    cityName,
    createdLabel: formatDate(ride.createdAt, isArabic)
  };
}

function supportTypeLabel(type, isArabic) {
  const match = DRIVER_SUPPORT_TYPES.find((item) => item.value === type);
  return match ? (isArabic ? match.ar : match.en) : type;
}

function DriverSectionFallback({ isArabic }) {
  return (
    <div className="lazy-section-fallback" role="status">
      <span />
      <strong>{isArabic ? "جاري تحميل الخريطة..." : "Loading map..."}</strong>
    </div>
  );
}

export function DriverPanel({ state, dispatch, t, isArabic, selectedDriver }) {
  const watchIdRef = useRef(null);
  const [trackingMessage, setTrackingMessage] = useState("");
  const [supportForm, setSupportForm] = useState({ type: "ride_issue", message: "", rideId: "" });
  const sessionDriver = state.session?.driver || {};
  const driver = {
    ...selectedDriver,
    ...sessionDriver,
    id: state.session?.driverId || sessionDriver.id || selectedDriver?.id,
    fullName: sessionDriver.fullName || selectedDriver?.fullName || selectedDriver?.nameAr || selectedDriver?.nameEn || "",
    phone: sessionDriver.phone || selectedDriver?.phone || "",
    cityId: sessionDriver.cityId || sessionDriver.city || selectedDriver?.cityId || state.cityId,
    vehicle: sessionDriver.vehicle || sessionDriver.vehicleType || selectedDriver?.vehicle || selectedDriver?.vehicleType || "",
    plate: sessionDriver.plate || sessionDriver.vehiclePlate || selectedDriver?.plate || selectedDriver?.vehiclePlate || "",
    status: sessionDriver.status || selectedDriver?.status || "active",
    rating: sessionDriver.rating || selectedDriver?.rating || "4.8"
  };
  const driverId = driver.id || "";
  const driverName = driver.fullName || (isArabic ? "كابتن واصل" : "Wasel captain");
  const isDriverActive = driver.status === "active" || driver.status === "approved";
  const driverData = useDriverData({
    enabled: Boolean(driverId) && isDriverActive,
    driverId,
    phone: driver.phone,
    cityId: driver.cityId
  });
  const supportData = useSupportTickets({
    enabled: Boolean(driver.phone) && isDriverActive,
    phone: driver.phone,
    role: "driver"
  });
  const paymentsData = usePayments({
    enabled: Boolean(driverId) && isDriverActive,
    driverId,
    phone: driver.phone,
    role: "driver"
  });

  const availableRides = driverData.availableRides.map((ride) => normalizeDriverRide(ride, state, isArabic));
  const driverRides = driverData.myRides.map((ride) => normalizeDriverRide(ride, state, isArabic));
  const activeRemoteRide = driverRides.find((ride) => ACTIVE_DRIVER_RIDE_STATUSES.includes(ride.status));
  const activeLocalRide =
    state.ride?.driverId === driverId && ACTIVE_DRIVER_RIDE_STATUSES.includes(state.ride.status)
      ? normalizeDriverRide(state.ride, state, isArabic)
      : null;
  const currentRide = activeRemoteRide || activeLocalRide || null;
  const canTrackCurrentRide = Boolean(currentRide?.id && driverId && ACTIVE_DRIVER_RIDE_STATUSES.includes(currentRide.status));
  const liveTrackingStatus = state.liveTrackingStatus || "idle";
  const liveTrackingLabel =
    liveTrackingStatus === "active"
      ? (isArabic ? "مباشر" : "Live")
      : liveTrackingStatus === "requesting"
        ? (isArabic ? "طلب GPS" : "Requesting GPS")
        : liveTrackingStatus === "denied"
          ? (isArabic ? "GPS مرفوض" : "GPS denied")
          : liveTrackingStatus === "socket-unavailable"
            ? (isArabic ? "Socket غير متاح" : "Socket unavailable")
            : (isArabic ? "غير مفعل" : "Not active");
  const completedTrips = driverRides.filter((ride) => ride.status === RIDE_STATUSES.completed);
  const historyRides = driverRides.length ? driverRides : currentRide ? [currentRide] : [];
  const supportRideOptions = currentRide ? [currentRide, ...historyRides.filter((ride) => ride.id !== currentRide.id)] : historyRides;
  const earningsSummary = paymentsData.driverEarnings.summary || {};
  const driverWalletTransactions = paymentsData.driverWalletTransactions.length
    ? paymentsData.driverWalletTransactions
    : paymentsData.driverEarnings.transactions || [];
  const todayEarnings = earningsSummary.todayEarnings ?? completedTrips.reduce((sum, ride) => sum + Number(ride.fareIls || 0), 0);
  const totalEarnings = earningsSummary.totalEarnings ?? todayEarnings;

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  function showToast(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  function updateSupportForm(field, value) {
    setSupportForm((current) => ({ ...current, [field]: value }));
  }

  async function submitSupportTicket(event) {
    event.preventDefault();
    if (!supportForm.message.trim()) {
      showToast("اكتب تفاصيل المشكلة قبل إرسال تذكرة الدعم.", "Write issue details before sending support.");
      return;
    }

    try {
      await supportData.createTicket({
        name: driver.fullName || driverName,
        phone: driver.phone,
        role: "driver",
        type: supportForm.type,
        message: supportForm.message.trim(),
        rideId: supportForm.rideId
      });
      setSupportForm({ type: "ride_issue", message: "", rideId: "" });
      showToast("تم إرسال تذكرة دعم الكابتن.", "Captain support ticket sent.");
    } catch {
      showToast("تعذر إرسال تذكرة الدعم. تأكد أن السيرفر يعمل.", "Unable to send support ticket. Make sure the backend is running.");
    }
  }

  function publishLocation(position) {
    if (!currentRide?.id || !driverId) return;
    const location = {
      rideId: currentRide.id,
      driverId,
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: new Date().toISOString()
    };
    const delivered = sendDriverLocationUpdate(location);
    dispatch({
      type: "driverLocation",
      payload: { ...location, location: { lat: location.lat, lng: location.lng } }
    });
    dispatch({
      type: "patch",
      patch: {
        liveTrackingStatus: delivered ? "active" : "socket-unavailable",
        liveTrackingError: delivered ? "" : "socket-unavailable",
        lastDriverLocationAt: location.timestamp
      }
    });
    setTrackingMessage(
      delivered
        ? (isArabic ? "تم إرسال موقعك المباشر للرحلة." : "Live location sent for this ride.")
        : (isArabic ? "التتبع المباشر غير متاح حاليًا." : "Live tracking is currently unavailable.")
    );
  }

  function publishLocationUnavailable(reason = "gps-unavailable") {
    sendDriverLocationUnavailable({
      rideId: currentRide?.id || "",
      driverId,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  function stopLiveTracking(reason = "driver-stopped-tracking") {
    if (watchIdRef.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    publishLocationUnavailable(reason);
    dispatch({
      type: "patch",
      patch: {
        liveTrackingStatus: "idle",
        liveTrackingError: "",
        toast: isArabic ? "تم إيقاف تتبع الموقع المباشر." : "Live location tracking stopped."
      }
    });
    setTrackingMessage(isArabic ? "توقف التتبع المباشر." : "Live tracking stopped.");
  }

  function handleStartLiveTracking() {
    if (!canTrackCurrentRide) {
      showToast("فعّل التتبع بعد قبول رحلة نشطة.", "Start tracking after accepting an active ride.");
      return;
    }
    if (!state.realtimeConnected) {
      dispatch({ type: "patch", patch: { liveTrackingStatus: "socket-unavailable", liveTrackingError: "socket-unavailable" } });
      setTrackingMessage(isArabic ? "التتبع المباشر غير متاح حاليًا." : "Live tracking is currently unavailable.");
      return;
    }
    if (!("geolocation" in navigator)) {
      publishLocationUnavailable("gps-unsupported");
      dispatch({ type: "patch", patch: { liveTrackingStatus: "denied", liveTrackingError: "gps-unsupported" } });
      setTrackingMessage(isArabic ? "المتصفح لا يدعم GPS." : "This browser does not support GPS.");
      return;
    }

    dispatch({ type: "patch", patch: { liveTrackingStatus: "requesting", liveTrackingError: "" } });
    setTrackingMessage(isArabic ? "نطلب إذن GPS لبدء التتبع." : "Requesting GPS permission to start tracking.");

    const handleError = () => {
      publishLocationUnavailable("gps-denied");
      dispatch({ type: "patch", patch: { liveTrackingStatus: "denied", liveTrackingError: "gps-denied" } });
      setTrackingMessage(isArabic ? "لم يتم السماح بالوصول للموقع." : "Location permission was not allowed.");
    };

    try {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(publishLocation, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      });
    } catch {
      handleError();
    }
  }

  async function handleToggleOnline() {
    const online = !state.driverOnline;
    dispatch({ type: "patch", patch: { driverOnline: online } });
    try {
      await driverData.updateOnlineStatus({ driverId, online });
      dispatch({ type: "patch", patch: { backendLive: true } });
    } catch {
      dispatch({ type: "patch", patch: { driverOnline: !online, backendLive: false } });
      showToast("تعذر تحديث حالة الكابتن.", "Unable to update captain availability.");
    }
  }

  async function handleAcceptRide(ride) {
    try {
      const payload = await driverData.acceptRide({ rideId: ride.id, driverId });
      dispatch({
        type: "patch",
        patch: {
          ride: payload.ride,
          backendLive: true,
          toast: isArabic ? "تم قبول الرحلة ونقلها إلى رحلتي الحالية." : "Ride accepted and moved to your current ride."
        }
      });
    } catch {
      showToast("تعذر قبول الرحلة. ربما قُبلت من كابتن آخر.", "Unable to accept this ride. It may have been taken.");
    }
  }

  async function handleUpdateRideStatus(status) {
    if (!currentRide) return;
    try {
      const payload = await driverData.updateRideStatus({ rideId: currentRide.id, driverId, status });
      dispatch({
        type: "patch",
        patch: {
          ride: payload.ride,
          backendLive: true,
          toast: statusText[state.language][payload.ride.status] || payload.ride.status
        }
      });
      if (status === RIDE_STATUSES.completed || status === RIDE_STATUSES.cancelled) {
        stopLiveTracking(status === RIDE_STATUSES.completed ? "ride-completed" : "ride-cancelled");
      }
      if (status === RIDE_STATUSES.completed) {
        paymentsData.refetchDriverEarnings();
        paymentsData.refetchDriverWalletTransactions();
      }
    } catch {
      showToast("تعذر تحديث حالة الرحلة حسب التسلسل الحالي.", "Unable to update the ride status in the current sequence.");
    }
  }

  const emptyAvailableMessage = state.driverOnline
    ? (isArabic ? "لا توجد رحلات متاحة الآن. استخدم تحديث لجلب الطلبات الجديدة." : "No available rides now. Refresh to fetch new requests.")
    : (isArabic ? "افتح أونلاين حتى تتمكن من قبول الرحلات." : "Go online to accept available rides.");

  return (
    <div className="driver-dashboard">
      <section className="driver-hero-card">
        <div className="driver-hero-top">
          <Avatar label={driverName.slice(0, 1)} />
          <div>
            <span>{isArabic ? "لوحة الكابتن" : "Captain dashboard"}</span>
            <h2>{driverName}</h2>
            <p>{driver.vehicle || "-"} · {driver.plate || "-"}</p>
            <small>{driver.phone || "-"} · {cityNameById(state.cities, driver.cityId, isArabic)}</small>
          </div>
          <span className={`driver-status-pill ${state.driverOnline ? "online" : "offline"}`}>
            {state.driverOnline ? t.online : t.offline}
          </span>
        </div>
        <div className="driver-hero-actions">
          <button className={state.driverOnline ? "secondary danger-soft" : "primary"} onClick={handleToggleOnline} disabled={!driverId || !isDriverActive || driverData.isMutating}>
            {state.driverOnline ? t.goOffline : t.goOnline}
          </button>
          <button className="secondary" onClick={() => driverData.refetchAvailableRides()} disabled={driverData.isAvailableLoading}>
            {isArabic ? "تحديث الطلبات" : "Refresh requests"}
          </button>
          <span className={state.realtimeConnected ? "realtime-status-pill live" : "realtime-status-pill fallback"}>
            {state.realtimeConnected
              ? (isArabic ? "التحديث المباشر فعال" : "Realtime active")
              : (isArabic ? "التحديث التلقائي غير متاح" : "Realtime unavailable")}
          </span>
          <StatusBadge status={isDriverActive ? "accepted" : "cancelled"} label={isDriverActive ? (isArabic ? "نشط" : "Active") : (isArabic ? "موقوف" : "Suspended")} />
        </div>
      </section>

      <section className="driver-kpi-grid">
        <Metric label={isArabic ? "أرباح مكتملة" : "Completed earnings"} value={`${todayEarnings} ₪`} />
        <Metric label={isArabic ? "رحلاتي" : "My rides"} value={driverRides.length} />
        <Metric label={t.rating} value={driver.rating} />
        <Metric label={isArabic ? "مكتملة" : "Completed"} value={completedTrips.length} />
      </section>

      <section className="driver-earnings-card">
        <PanelTitle
          title={isArabic ? "أرباح ومحفظة الكابتن" : "Captain earnings and wallet"}
          meta={paymentsData.isLoading ? (isArabic ? "تحميل" : "Loading") : `${driverWalletTransactions.length}`}
        />
        {paymentsData.backendError && (
          <p className="driver-panel-error">{isArabic ? "تعذر تحميل الأرباح من نظام الدفع." : "Unable to load earnings from the payment system."}</p>
        )}
        <div className="driver-earnings-grid">
          <span><small>{isArabic ? "أرباح اليوم" : "Today earnings"}</small><strong>{todayEarnings} ₪</strong></span>
          <span><small>{isArabic ? "الإجمالي" : "Total"}</small><strong>{totalEarnings} ₪</strong></span>
          <span><small>{isArabic ? "رحلات مكتملة" : "Completed rides"}</small><strong>{earningsSummary.completedRides ?? completedTrips.length}</strong></span>
        </div>
        <div className="driver-wallet-list">
          {driverWalletTransactions.length ? (
            driverWalletTransactions.slice(0, 4).map((transaction) => (
              <div className="driver-wallet-row" key={transaction.id}>
                <span>
                  <strong>{transaction.referenceId || transaction.referenceType}</strong>
                  <small>{transaction.note || transaction.type}</small>
                </span>
                <b>{transaction.amountIls ?? transaction.amount} ₪</b>
              </div>
            ))
          ) : (
            <div className="detail-empty compact">{isArabic ? "ستظهر عمليات المحفظة بعد إكمال رحلة." : "Wallet transactions appear after completing rides."}</div>
          )}
        </div>
      </section>

      <section className="driver-map-card">
        <PanelTitle title={isArabic ? "نطاق العمل والخريطة" : "Work zone and map"} meta={cityNameById(state.cities, driver.cityId, isArabic)} />
        <Suspense fallback={<DriverSectionFallback isArabic={isArabic} />}>
          <MapBoard state={state} dispatch={dispatch} selectedDriver={driver} t={t} isArabic={isArabic} />
        </Suspense>
      </section>

      <section className="driver-requests-card">
        <PanelTitle title={isArabic ? "الرحلات المتاحة" : "Available rides"} meta={driverData.isAvailableLoading ? (isArabic ? "تحميل" : "Loading") : `${availableRides.length}`} />
        {driverData.backendError && (
          <p className="driver-panel-error">{isArabic ? "تعذر الاتصال بواجهات الكابتن. البيانات لا تُحدّث الآن." : "Unable to reach driver APIs. Data is not updating now."}</p>
        )}
        {availableRides.length ? (
          <div className="driver-request-list">
            {availableRides.map((ride) => (
              <div className="driver-request-card" key={ride.id}>
                <div className="driver-card-head">
                  <strong>{ride.code}</strong>
                  <StatusBadge status={ride.status} label={ride.statusLabel} />
                </div>
                <div className="driver-route-line">
                  <span><small>{t.pickup}</small><b>{ride.pickup}</b></span>
                  <span><small>{t.dropoff}</small><b>{ride.dropoff}</b></span>
                </div>
                <div className="driver-request-meta">
                  <span>{ride.customerName || ride.customer}</span>
                  <span>{ride.cityName}</span>
                  <span>{ride.distanceKm} km</span>
                  <span>{ride.etaMinutes} min</span>
                  <span>{ride.paymentLabel}</span>
                  <strong>{ride.fareIls} ₪</strong>
                </div>
                <div className="driver-action-row">
                  <button className="primary" onClick={() => handleAcceptRide(ride)} disabled={!state.driverOnline || !isDriverActive || driverData.isMutating}>
                    {t.acceptRide}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">{emptyAvailableMessage}</div>
        )}
      </section>

      <section className="driver-current-card">
        <PanelTitle title={isArabic ? "رحلتي الحالية" : "Current ride"} meta={currentRide ? <StatusBadge status={currentRide.status} label={currentRide.statusLabel} /> : "-"} />
        {currentRide ? (
          <div className="driver-current-stack">
            <div className="driver-card-head">
              <strong>{currentRide.code}</strong>
              <b>{currentRide.fareIls} ₪</b>
            </div>
            <div className="driver-route-line">
              <span><small>{isArabic ? "الزبون" : "Customer"}</small><b>{currentRide.customerName || currentRide.customer || "-"}</b></span>
              <span><small>{isArabic ? "الهاتف" : "Phone"}</small><b>{currentRide.customerPhone || "-"}</b></span>
              <span><small>{t.pickup}</small><b>{currentRide.pickup}</b></span>
              <span><small>{t.dropoff}</small><b>{currentRide.dropoff}</b></span>
            </div>
            <div className="driver-request-meta">
              <span>{currentRide.distanceKm} km</span>
              <span>{currentRide.etaMinutes} min</span>
              <span>{currentRide.paymentLabel}</span>
              <span>{currentRide.createdLabel}</span>
            </div>
            <div className={`driver-tracking-panel ${liveTrackingStatus}`}>
              <span>
                <small>{isArabic ? "تتبع موقعي" : "My live location"}</small>
                <strong>{liveTrackingLabel}</strong>
              </span>
              {state.lastDriverLocationAt && (
                <span>
                  <small>{isArabic ? "آخر تحديث" : "Last update"}</small>
                  <strong>{formatDate(state.lastDriverLocationAt, isArabic)}</strong>
                </span>
              )}
              {trackingMessage && <p>{trackingMessage}</p>}
              <div className="driver-action-row">
                <button className="secondary" type="button" onClick={handleStartLiveTracking} disabled={!canTrackCurrentRide || liveTrackingStatus === "requesting"}>
                  {liveTrackingStatus === "active" ? (isArabic ? "تحديث موقعي" : "Update my location") : (isArabic ? "تفعيل موقعي المباشر" : "Start live location")}
                </button>
                <button className="secondary danger-soft" type="button" onClick={() => stopLiveTracking()} disabled={liveTrackingStatus !== "active" && liveTrackingStatus !== "requesting"}>
                  {isArabic ? "إيقاف التتبع" : "Stop tracking"}
                </button>
              </div>
            </div>
            <div className="driver-action-row driver-status-actions">
              {DRIVER_STATUS_ACTIONS.map((action) => (
                <button
                  className={currentRide.status === action.from ? "primary" : "secondary"}
                  key={action.next}
                  onClick={() => handleUpdateRideStatus(action.next)}
                  disabled={currentRide.status !== action.from || driverData.isMutating}
                >
                  {isArabic ? action.labelAr : action.labelEn}
                </button>
              ))}
              <button
                className="secondary danger-soft"
                onClick={() => handleUpdateRideStatus(RIDE_STATUSES.cancelled)}
                disabled={currentRide.status !== RIDE_STATUSES.accepted || driverData.isMutating}
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty">{isArabic ? "لا توجد رحلة حالية. اقبل رحلة من القائمة المتاحة." : "No current ride. Accept one from the available list."}</div>
        )}
      </section>

      <section className="driver-support-card">
        <PanelTitle title={isArabic ? "دعم الكابتن" : "Captain support"} meta={`${supportData.tickets.length}`} />
        <form className="support-ticket-form" onSubmit={submitSupportTicket}>
          <label className="field">
            <span>{isArabic ? "نوع المشكلة" : "Issue type"}</span>
            <select value={supportForm.type} onChange={(event) => updateSupportForm("type", event.target.value)}>
              {DRIVER_SUPPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{isArabic ? type.ar : type.en}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{isArabic ? "رحلة مرتبطة - اختياري" : "Linked ride - optional"}</span>
            <select value={supportForm.rideId} onChange={(event) => updateSupportForm("rideId", event.target.value)}>
              <option value="">{isArabic ? "بدون رحلة" : "No linked ride"}</option>
              {supportRideOptions.map((ride) => (
                <option key={ride.id} value={ride.id}>{ride.code} - {ride.pickup} / {ride.dropoff}</option>
              ))}
            </select>
          </label>
          <label className="field support-message-field">
            <span>{isArabic ? "الرسالة" : "Message"}</span>
            <textarea value={supportForm.message} rows={4} onChange={(event) => updateSupportForm("message", event.target.value)} placeholder={isArabic ? "اشرح المشكلة لفريق العمليات..." : "Explain the issue for operations..."} />
          </label>
          <div className="driver-action-row">
            <button className="primary" type="submit" disabled={supportData.isCreating || !driver.phone}>
              {supportData.isCreating ? (isArabic ? "جار الإرسال..." : "Sending...") : (isArabic ? "إرسال تذكرة" : "Send ticket")}
            </button>
            <button className="secondary" type="button" onClick={() => supportData.refetchTickets()} disabled={supportData.isLoading}>
              {isArabic ? "تحديث التذاكر" : "Refresh tickets"}
            </button>
          </div>
        </form>
        <div className="support-ticket-list">
          {supportData.isLoading && <p className="support-ticket-empty">{isArabic ? "جار تحميل تذاكر الكابتن..." : "Loading captain tickets..."}</p>}
          {supportData.backendError && <p className="support-ticket-error">{isArabic ? "تعذر تحميل تذاكر الدعم." : "Unable to load support tickets."}</p>}
          {!supportData.isLoading && !supportData.tickets.length && (
            <p className="support-ticket-empty">{isArabic ? "لا توجد تذاكر دعم للكابتن بعد." : "No captain support tickets yet."}</p>
          )}
          {supportData.tickets.map((ticket) => (
            <article className="support-ticket-card" key={ticket.id}>
              <div>
                <strong>{supportTypeLabel(ticket.type, isArabic)}</strong>
                <p>{ticket.message}</p>
                {ticket.rideId && <small>{isArabic ? "رحلة مرتبطة" : "Linked ride"}: {ticket.rideId}</small>}
              </div>
              <StatusBadge status={ticket.status} label={ticket.status} />
              <small>{formatDate(ticket.createdAt, isArabic)}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="driver-history-card">
        <PanelTitle title={isArabic ? "سجل رحلات الكابتن" : "Captain ride history"} meta={`${historyRides.length}`} />
        <div className="driver-history-list">
          {historyRides.length ? (
            historyRides.map((ride) => (
              <div className="driver-history-row" key={ride.id}>
                <span>
                  <strong>{ride.code}</strong>
                  <small>{ride.pickup} · {ride.dropoff}</small>
                </span>
                <StatusBadge status={ride.status} label={ride.statusLabel} />
                <small>{ride.createdLabel}</small>
                <b>{ride.fareIls} ₪</b>
              </div>
            ))
          ) : (
            <div className="detail-empty compact">{isArabic ? "ستظهر الرحلات هنا بعد قبول الطلبات." : "Trips will appear here after accepting requests."}</div>
          )}
        </div>
      </section>
    </div>
  );
}
