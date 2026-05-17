import { useState } from "react";
import { Toast } from "../../components/ui/index.js";
import { AuthField } from "./AuthField.jsx";

export function AuthScreen({ state, dispatch, t, isArabic }) {
  const [authMode, setAuthMode] = useState("login");
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    age: "",
    birthDate: "",
    city: state.cityId,
    phone: state.phone,
    password: "",
    confirmPassword: ""
  });
  const [captainForm, setCaptainForm] = useState({
    fullName: "",
    phone: state.phone,
    city: state.cityId,
    age: "",
    vehicleType: "",
    vehicleNumber: "",
    notes: ""
  });
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [otpCode, setOtpCode] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [captainRequestSubmitted, setCaptainRequestSubmitted] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const copy = isArabic
    ? {
        description: "تنقل آمن وسريع داخل مدينتك، من طلب المشوار حتى متابعة السائق والدفع بطريقة واضحة.",
        trust: "واجهة الزبون",
        headline: "ابدأ رحلتك بعد تسجيل الدخول فقط",
        loginHelp: "ادخل باسمك أو رقم هاتفك للوصول إلى واجهة طلب المشوار.",
        registerHelp: "أنشئ حسابك ثم تحقق برمز OTP التجريبي قبل العودة لتسجيل الدخول.",
        otpHelp: "أدخل رمز التحقق المرسل. في هذه النسخة التجريبية استخدم 1234.",
        support: ["المساعدة والدعم", "تواصل مع الإدارة", "مشكلة في الدخول؟"],
        captainJoin: "طلب الانضمام للكباتن",
        captainTitle: "انضم ككابتن توصيل",
        captainIntro: "قدّم طلبك الآن وسيتم التواصل معك من الإدارة بعد مراجعة بياناتك.",
        captainReview: "حساب الكابتن لا يتم تفعيله إلا بعد موافقة الإدارة/صاحب التطبيق.",
        captainSuccess: "تم إرسال طلبك للإدارة وهو الآن قيد المراجعة.",
        captainCta: "إرسال الطلب للإدارة",
        captainMissing: "يرجى تعبئة بيانات طلب الكابتن الأساسية.",
        success: "تم التحقق من الحساب. يمكنك تسجيل الدخول الآن.",
        loginSuccess: "تم تسجيل الدخول بنجاح",
        missing: "يرجى تعبئة كل الحقول المطلوبة.",
        passwordMismatch: "كلمتا السر غير متطابقتين.",
        passwordShort: "كلمة السر يجب أن تكون 6 أحرف على الأقل.",
        wrongOtp: "رمز التحقق غير صحيح.",
        wrongLogin: "بيانات الدخول لا تطابق الحساب الذي تم إنشاؤه."
      }
    : {
        description: "Safe, fast rides in your city, from request to driver tracking and clear payment.",
        trust: "Customer app",
        headline: "Start your trip only after sign in",
        loginHelp: "Enter your name or phone number to access the ride request interface.",
        registerHelp: "Create your account, verify with the demo OTP, then return to login.",
        otpHelp: "Enter the verification code. In this demo build use 1234.",
        support: ["Help and support", "Contact management", "Having login trouble?"],
        captainJoin: "Join as delivery captain",
        captainTitle: "Apply as a delivery captain",
        captainIntro: "Apply now and management will contact you after reviewing your details.",
        captainReview: "Captain accounts are activated only after approval from management or the app owner.",
        captainSuccess: "Your request was sent to management and is now under review.",
        captainCta: "Send request to management",
        captainMissing: "Please fill the required captain request details.",
        success: "Account verified. You can log in now.",
        loginSuccess: "Logged in successfully",
        missing: "Please fill all required fields.",
        passwordMismatch: "Passwords do not match.",
        passwordShort: "Password must be at least 6 characters.",
        wrongOtp: "Wrong verification code.",
        wrongLogin: "Login details do not match the registered account."
      };

  function switchMode(mode) {
    setAuthMode(mode);
    setAuthError("");
    setAuthNotice("");
  }

  function updateRegister(field, value) {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  }

  function updateLogin(field, value) {
    setLoginForm((current) => ({ ...current, [field]: value }));
  }

  function updateCaptain(field, value) {
    setCaptainForm((current) => ({ ...current, [field]: value }));
    setCaptainRequestSubmitted(false);
  }

  function handleRegister(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    const requiredFields = ["fullName", "age", "birthDate", "city", "phone", "password", "confirmPassword"];
    const hasMissingField = requiredFields.some((field) => !String(registerForm[field] || "").trim());
    if (hasMissingField) {
      setAuthError(copy.missing);
      return;
    }
    if (registerForm.password.length < 6) {
      setAuthError(copy.passwordShort);
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError(copy.passwordMismatch);
      return;
    }

    setPendingUser(registerForm);
    setOtpCode("");
    setAuthMode("otp");
    dispatch({ type: "toast", message: isArabic ? "رمز التحقق التجريبي 1234" : "Demo verification code 1234" });
  }

  function handleOtp(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    if (otpCode.trim() !== "1234") {
      setAuthError(copy.wrongOtp);
      return;
    }

    setVerifiedUser(pendingUser);
    setLoginForm({ identifier: pendingUser?.phone || "", password: "" });
    setAuthMode("login");
    setAuthNotice(copy.success);
  }

  function handleLogin(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    if (!loginForm.identifier.trim() || !loginForm.password.trim()) {
      setAuthError(copy.missing);
      return;
    }

    const normalizedIdentifier = loginForm.identifier.trim();
    if (
      verifiedUser &&
      (loginForm.password !== verifiedUser.password ||
        (normalizedIdentifier !== verifiedUser.phone && normalizedIdentifier !== verifiedUser.fullName))
    ) {
      setAuthError(copy.wrongLogin);
      return;
    }

    const sessionUser = verifiedUser || {
      fullName: normalizedIdentifier,
      phone: normalizedIdentifier,
      city: state.cityId
    };

    dispatch({
      type: "patch",
      patch: {
        role: "customer",
        session: {
          role: "customer",
          name: sessionUser.fullName,
          phone: sessionUser.phone,
          verified: Boolean(verifiedUser)
        },
        phone: sessionUser.phone,
        cityId: sessionUser.city || state.cityId,
        toast: copy.loginSuccess
      }
    });
  }

  function handleCaptainRequest(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    const requiredFields = ["fullName", "phone", "city", "age", "vehicleType"];
    const hasMissingField = requiredFields.some((field) => !String(captainForm[field] || "").trim());
    if (hasMissingField) {
      setAuthError(copy.captainMissing);
      return;
    }

    setCaptainRequestSubmitted(true);
    setAuthNotice(copy.captainSuccess);
    dispatch({ type: "toast", message: copy.captainSuccess });
  }

  function showSupportMessage(index) {
    const messages = isArabic
      ? [
          "الدعم جاهز لمساعدتك داخل التطبيق.",
          "سيتم تحويل طلبك إلى الإدارة في النسخة المتصلة.",
          "جرّب إنشاء حساب جديد أو استخدم كلمة السر التي سجلت بها."
        ]
      : [
          "Support is ready to help inside the app.",
          "Your request will be routed to management in the connected build.",
          "Try registering a new account or use the password you created."
        ];
    dispatch({ type: "toast", message: messages[index] });
  }

  const supportItems = [...copy.support, copy.captainJoin];

  return (
    <main className={`welcome-auth auth-mode-${authMode}`} data-auth-states="auth-mode-login auth-mode-register auth-mode-otp auth-mode-captain">
      <section className="welcome-auth-hero">
        <div className="welcome-auth-top">
          <div className="welcome-brand">
            <span className="brand-mark">W</span>
            <div>
              <strong>{t.brand}</strong>
              <small>{t.tagline}</small>
            </div>
          </div>
          <button className="icon-button" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>
            {t.language}
          </button>
        </div>

        <div className="welcome-copy">
          <span>{copy.trust}</span>
          <h1>{copy.headline}</h1>
          <p>{copy.description}</p>
        </div>

        <div className="welcome-auth-support">
          {supportItems.map((item, index) => (
            <button
              type="button"
              key={item}
              onClick={() => (index === copy.support.length ? switchMode("captain") : showSupportMessage(index))}
            >
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="auth-panel" aria-label={isArabic ? "تسجيل الدخول وإنشاء الحساب" : "Login and registration"}>
        <div className="auth-tabs" role="tablist" aria-label={isArabic ? "خيارات الحساب" : "Account options"}>
          <button
            type="button"
            className={authMode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
            aria-selected={authMode === "login"}
          >
            <strong>Login</strong>
            <span>{isArabic ? "تسجيل دخول" : "Sign in"}</span>
          </button>
          <button
            type="button"
            className={authMode === "register" ? "active" : ""}
            onClick={() => switchMode("register")}
            aria-selected={authMode === "register"}
          >
            <strong>Register</strong>
            <span>{isArabic ? "إنشاء حساب" : "Create account"}</span>
          </button>
        </div>

        {authMode === "login" && (
          <form className="auth-form auth-mode-login" onSubmit={handleLogin}>
            <div className="auth-form-title">
              <h2>{isArabic ? "مرحبًا بعودتك" : "Welcome back"}</h2>
              <p>{copy.loginHelp}</p>
            </div>
            <AuthField
              label={isArabic ? "الاسم أو رقم الهاتف" : "Name or phone"}
              name="identifier"
              value={loginForm.identifier}
              onChange={(value) => updateLogin("identifier", value)}
              autoComplete="username"
            />
            <AuthField
              label={isArabic ? "كلمة السر" : "Password"}
              name="loginPassword"
              type="password"
              value={loginForm.password}
              onChange={(value) => updateLogin("password", value)}
              autoComplete="current-password"
            />
            {authNotice && <p className="auth-notice">{authNotice}</p>}
            {authError && <p className="auth-error">{authError}</p>}
            <button className="primary auth-submit" type="submit">{isArabic ? "دخول إلى التطبيق" : "Enter app"}</button>
          </form>
        )}

        {authMode === "register" && (
          <form className="auth-form auth-mode-register" onSubmit={handleRegister}>
            <div className="auth-form-title">
              <h2>{isArabic ? "إنشاء حساب زبون" : "Create customer account"}</h2>
              <p>{copy.registerHelp}</p>
            </div>
            <div className="auth-field-grid">
              <AuthField label={isArabic ? "الاسم الكامل" : "Full name"} name="fullName" value={registerForm.fullName} onChange={(value) => updateRegister("fullName", value)} autoComplete="name" />
              <AuthField label={isArabic ? "العمر" : "Age"} name="age" type="number" min="1" value={registerForm.age} onChange={(value) => updateRegister("age", value)} inputMode="numeric" />
              <AuthField label={isArabic ? "تاريخ الميلاد" : "Birth date"} name="birthDate" type="date" value={registerForm.birthDate} onChange={(value) => updateRegister("birthDate", value)} />
              <label className="field auth-field">
                <span>{isArabic ? "المدينة" : "City"}</span>
                <select name="city" value={registerForm.city} onChange={(event) => updateRegister("city", event.target.value)}>
                  {state.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {isArabic ? city.ar : city.en}
                    </option>
                  ))}
                </select>
              </label>
              <AuthField label={isArabic ? "رقم الهاتف" : "Phone number"} name="phone" type="tel" value={registerForm.phone} onChange={(value) => updateRegister("phone", value)} autoComplete="tel" />
              <AuthField label={isArabic ? "كلمة السر" : "Password"} name="password" type="password" value={registerForm.password} onChange={(value) => updateRegister("password", value)} autoComplete="new-password" />
              <AuthField label={isArabic ? "تأكيد كلمة السر" : "Confirm password"} name="confirmPassword" type="password" value={registerForm.confirmPassword} onChange={(value) => updateRegister("confirmPassword", value)} autoComplete="new-password" />
            </div>
            {authError && <p className="auth-error">{authError}</p>}
            <button className="primary auth-submit" type="submit">{isArabic ? "إنشاء الحساب" : "Create account"}</button>
          </form>
        )}

        {authMode === "otp" && (
          <form className="auth-form auth-mode-otp" onSubmit={handleOtp}>
            <div className="auth-form-title">
              <h2>{isArabic ? "رمز التحقق OTP" : "OTP verification"}</h2>
              <p>{copy.otpHelp}</p>
            </div>
            <div className="otp-preview">
              <span>{isArabic ? "رمز تجريبي آمن" : "Safe demo code"}</span>
              <strong>1234</strong>
            </div>
            <AuthField
              label={isArabic ? "أدخل رمز OTP" : "Enter OTP"}
              name="otp"
              value={otpCode}
              onChange={setOtpCode}
              inputMode="numeric"
              maxLength="4"
              autoComplete="one-time-code"
            />
            {authError && <p className="auth-error">{authError}</p>}
            <div className="auth-actions">
              <button className="secondary" type="button" onClick={() => switchMode("register")}>{isArabic ? "تعديل البيانات" : "Edit details"}</button>
              <button className="primary" type="submit">{isArabic ? "تحقق" : "Verify"}</button>
            </div>
          </form>
        )}

        {authMode === "captain" && (
          <form className="auth-form auth-mode-captain captain-request-card" onSubmit={handleCaptainRequest}>
            <div className="auth-form-title">
              <h2>{copy.captainTitle}</h2>
              <p>{copy.captainIntro}</p>
            </div>
            <div className="captain-review-note">
              <span>{isArabic ? "مراجعة إدارية" : "Management review"}</span>
              <strong>{copy.captainReview}</strong>
            </div>
            <div className="auth-field-grid">
              <AuthField label={isArabic ? "الاسم الكامل" : "Full name"} name="captainFullName" value={captainForm.fullName} onChange={(value) => updateCaptain("fullName", value)} autoComplete="name" />
              <AuthField label={isArabic ? "رقم الهاتف" : "Phone number"} name="captainPhone" type="tel" value={captainForm.phone} onChange={(value) => updateCaptain("phone", value)} autoComplete="tel" />
              <label className="field auth-field">
                <span>{isArabic ? "المدينة" : "City"}</span>
                <select name="captainCity" value={captainForm.city} onChange={(event) => updateCaptain("city", event.target.value)}>
                  {state.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {isArabic ? city.ar : city.en}
                    </option>
                  ))}
                </select>
              </label>
              <AuthField label={isArabic ? "العمر" : "Age"} name="captainAge" type="number" min="18" value={captainForm.age} onChange={(value) => updateCaptain("age", value)} inputMode="numeric" />
              <label className="field auth-field">
                <span>{isArabic ? "نوع المركبة" : "Vehicle type"}</span>
                <select name="captainVehicleType" value={captainForm.vehicleType} onChange={(event) => updateCaptain("vehicleType", event.target.value)}>
                  <option value="">{isArabic ? "اختر نوع المركبة" : "Select vehicle type"}</option>
                  <option value="car">{isArabic ? "سيارة" : "Car"}</option>
                  <option value="motorcycle">{isArabic ? "دراجة نارية" : "Motorcycle"}</option>
                  <option value="van">{isArabic ? "فان / مركبة توصيل" : "Van / delivery vehicle"}</option>
                </select>
              </label>
              <AuthField label={isArabic ? "رقم المركبة إن وجد" : "Vehicle number if available"} name="captainVehicleNumber" value={captainForm.vehicleNumber} onChange={(value) => updateCaptain("vehicleNumber", value)} />
              <label className="field auth-field captain-notes-field">
                <span>{isArabic ? "ملاحظات اختيارية" : "Optional notes"}</span>
                <textarea
                  name="captainNotes"
                  value={captainForm.notes}
                  onChange={(event) => updateCaptain("notes", event.target.value)}
                  rows="4"
                />
              </label>
            </div>
            {authNotice && <p className="auth-notice">{authNotice}</p>}
            {authError && <p className="auth-error">{authError}</p>}
            {captainRequestSubmitted && (
              <div className="captain-success-card">
                <strong>{copy.captainSuccess}</strong>
                <span>{copy.captainReview}</span>
              </div>
            )}
            <div className="auth-actions">
              <button className="secondary" type="button" onClick={() => switchMode("login")}>{isArabic ? "العودة للدخول" : "Back to login"}</button>
              <button className="primary" type="submit">{copy.captainCta}</button>
            </div>
          </form>
        )}
      </section>
      <Toast message={state.toast} />
    </main>
  );
}
