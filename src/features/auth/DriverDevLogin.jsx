import { useEffect, useState } from "react";
import { appConfig } from "../../config/appConfig.js";
import { driverDevLogin, fetchDriverDevDrivers } from "../../services/driverApi.js";
import { setSessionToken } from "../../services/sessionToken.js";
import { ROLES } from "../../utils/roles.js";
import { AuthField } from "./AuthField.jsx";

export function DriverDevLogin({ dispatch, isArabic }) {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchDriverDevDrivers()
      .then((driverList) => {
        if (cancelled) return;
        setDrivers(driverList);
        setSelectedDriverId(driverList[0]?.id || "");
        setStatus("idle");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setError(isArabic ? "تعذر تحميل الكباتن الموافق عليهم من السيرفر." : "Unable to load approved captains from the server.");
      });
    return () => {
      cancelled = true;
    };
  }, [isArabic]);

  if (!import.meta.env.DEV || !appConfig.devDriverEnabled) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("loading");
    try {
      const payload = await driverDevLogin({ driverId: selectedDriverId, phone });
      const driver = payload.driver;
      const user = {
        ...payload.user,
        role: ROLES.driver,
        status: driver.status,
        driverId: driver.id,
        name: payload.user?.name || driver.fullName
      };
      setSessionToken(payload.token, ROLES.driver);
      dispatch({
        type: "patch",
        patch: {
          role: ROLES.driver,
          session: { ...user, driver },
          currentUser: user,
          token: payload.token,
          authStatus: "authenticated",
          selectedDriverId: driver.id,
          driverOnline: driver.online,
          cityId: driver.cityId || driver.city || "nablus",
          drivers: [driver],
          backendLive: true,
          toast: isArabic ? "تم دخول الكابتن للتطوير فقط." : "Development captain signed in."
        }
      });
      window.history.replaceState(null, "", "/driver/dashboard");
    } catch (loginError) {
      setStatus("error");
      setError(
        loginError?.status === 401
          ? (isArabic ? "الكابتن غير موافق عليه أو غير نشط." : "Captain is not approved or active.")
          : (isArabic ? "تعذر دخول الكابتن. تأكد أن السيرفر يعمل." : "Unable to sign in the captain. Make sure the Backend is running.")
      );
    }
  }

  return (
    <main className="welcome-auth auth-mode-login driver-dev-login" data-route="/driver/dev-login">
      <section className="auth-panel">
        <form className="auth-form auth-mode-login" onSubmit={handleSubmit}>
          <div className="auth-form-title">
            <h2>{isArabic ? "دخول كابتن للتطوير" : "Development captain login"}</h2>
            <p>{isArabic ? "Development Only: مدخل مؤقت للكباتن الموافق عليهم فقط، وسيستبدل لاحقًا بنظام دخول حقيقي." : "Development Only: temporary entry for approved captains only, to be replaced by real driver auth later."}</p>
          </div>
          <label className="field auth-field">
            <span>{isArabic ? "كابتن موافق عليه" : "Approved captain"}</span>
            <select value={selectedDriverId} onChange={(event) => setSelectedDriverId(event.target.value)}>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.fullName || driver.nameAr || driver.id} - {driver.cityLabel || driver.cityId}
                </option>
              ))}
            </select>
          </label>
          <AuthField
            label={isArabic ? "أو رقم هاتف الكابتن" : "Or captain phone"}
            name="driverDevPhone"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
          />
          <p className="auth-helper">
            {isArabic ? "لا يمكن لطلب انضمام غير موافق عليه الدخول من هنا." : "Unapproved captain applications cannot sign in here."}
          </p>
          {error && <p className="auth-error">{error}</p>}
          <button className="primary auth-submit" type="submit" disabled={status === "loading" || (!selectedDriverId && !phone)}>
            {status === "loading" ? (isArabic ? "جاري التحقق..." : "Checking...") : (isArabic ? "دخول لوحة الكابتن" : "Enter captain dashboard")}
          </button>
        </form>
      </section>
    </main>
  );
}
