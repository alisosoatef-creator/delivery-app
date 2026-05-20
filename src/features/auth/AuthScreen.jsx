import { useState } from "react";
import { Toast } from "../../components/ui/index.js";
import { useAuthApi } from "../../hooks/useAuthApi.js";
import { setSessionToken } from "../../services/sessionToken.js";
import { ROLES } from "../../utils/roles.js";
import { CaptainApplicationPanel } from "../driver/CaptainApplicationPanel.jsx";
import { AuthField } from "./AuthField.jsx";

const DEMO_OTP = "1234";
const MIN_CUSTOMER_AGE = 1;
const MAX_CUSTOMER_AGE = 120;

function cleanValue(value) {
  return String(value || "").trim();
}

function isReasonableAge(value) {
  const ageNumber = Number(value);
  return Number.isInteger(ageNumber) && ageNumber >= MIN_CUSTOMER_AGE && ageNumber <= MAX_CUSTOMER_AGE;
}

export function AuthScreen({ state, dispatch, t, isArabic }) {
  const { registerCustomer, verifyOtp, loginCustomer, isMutating } = useAuthApi();
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
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [otpCode, setOtpCode] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [captainApplicationOpen, setCaptainApplicationOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");

  const copy = isArabic
    ? {
        description: "تجربة دخول خاصة بالزبون فقط. أنشئ حسابك أو سجل دخولك، وبعدها تنتقل مباشرة إلى واجهة طلب المشوار.",
        trust: "واجهة الزبون",
        headline: "ابدأ بعد تسجيل الدخول",
        loginHelp: "استخدم الاسم الكامل أو رقم الهاتف للحساب الذي تم تأكيده برمز OTP.",
        registerHelp: "أدخل بيانات الزبون الأساسية، ثم تحقق برمز OTP التجريبي قبل تسجيل الدخول.",
        otpHelp: "أدخل رمز التحقق التجريبي لإكمال إنشاء الحساب. الرمز في هذه المرحلة هو 1234.",
        support: ["المساعدة والدعم", "تواصل مع الإدارة", "مشكلة في الدخول؟"],
        supportMessages: [
          "الدعم جاهز لمساعدتك داخل التطبيق.",
          "سيتم تحويل طلبك إلى الإدارة في النسخة المتصلة.",
          "أنشئ حسابًا جديدًا وتأكد من استخدام كلمة السر نفسها بعد OTP."
        ],
        captainJoin: "انضم ككابتن توصيل",
        success: "تم التحقق من الحساب. يمكنك تسجيل الدخول الآن.",
        loginSuccess: "تم تسجيل الدخول بنجاح",
        missing: "يرجى تعبئة كل الحقول المطلوبة.",
        invalidAge: "يرجى إدخال عمر منطقي بين 1 و120.",
        passwordMismatch: "كلمتا السر غير متطابقتين.",
        wrongOtp: "رمز التحقق غير صحيح.",
        noVerifiedAccount: "يجب إنشاء حساب وتأكيده برمز OTP قبل تسجيل الدخول.",
        wrongLogin: "بيانات الدخول لا تطابق الحساب الذي تم تأكيده."
      }
    : {
        description: "A customer-only entry experience. Create an account or sign in, then move straight into ride request.",
        trust: "Customer app",
        headline: "Start after sign in",
        loginHelp: "Use the full name or phone number for the account verified with OTP.",
        registerHelp: "Enter the customer details, then verify with the demo OTP before signing in.",
        otpHelp: "Enter the demo verification code to complete account creation. For this phase use 1234.",
        support: ["Help and support", "Contact management", "Having login trouble?"],
        supportMessages: [
          "Support is ready to help inside the app.",
          "Your request will be routed to management in the connected build.",
          "Create a new account and use the same password after OTP."
        ],
        captainJoin: "Join as delivery captain",
        success: "Account verified. You can log in now.",
        loginSuccess: "Logged in successfully",
        missing: "Please fill all required fields.",
        invalidAge: "Please enter a reasonable age between 1 and 120.",
        passwordMismatch: "Passwords do not match.",
        wrongOtp: "Wrong verification code.",
        noVerifiedAccount: "Create and verify an account with OTP before signing in.",
        wrongLogin: "Login details do not match the verified account."
      };

  const backendCopy = isArabic
    ? {
        duplicatePhone: "رقم الهاتف مسجل مسبقًا. استخدم تسجيل الدخول أو رقمًا آخر.",
        serverOffline: "تعذر الاتصال بالسيرفر. تأكد من تشغيل npm.cmd run api.",
        registering: "جاري إنشاء الحساب...",
        verifying: "جاري التحقق...",
        loggingIn: "جاري تسجيل الدخول..."
      }
    : {
        duplicatePhone: "This phone number is already registered. Sign in or use another number.",
        serverOffline: "Could not reach the server. Make sure npm.cmd run api is running.",
        registering: "Creating account...",
        verifying: "Verifying...",
        loggingIn: "Signing in..."
      };

  function authErrorMessage(error, fallback) {
    if (error?.status === 0) return backendCopy.serverOffline;
    if (error?.status === 409) return backendCopy.duplicatePhone;
    if (error?.status === 401) return fallback;
    return fallback || backendCopy.serverOffline;
  }

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

  async function handleRegister(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    const requiredFields = ["fullName", "age", "birthDate", "city", "phone", "password", "confirmPassword"];
    const hasMissingField = requiredFields.some((field) => !cleanValue(registerForm[field]));
    if (hasMissingField) {
      setAuthError(copy.missing);
      return;
    }

    if (!isReasonableAge(registerForm.age)) {
      setAuthError(copy.invalidAge);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError(copy.passwordMismatch);
      return;
    }

    const nextPendingUser = {
      fullName: cleanValue(registerForm.fullName),
      age: Number(registerForm.age),
      birthDate: cleanValue(registerForm.birthDate),
      city: cleanValue(registerForm.city),
      phone: cleanValue(registerForm.phone)
    };

    setAuthNotice(backendCopy.registering);
    try {
      const result = await registerCustomer({ ...nextPendingUser, password: registerForm.password, role: "customer" });
      setPendingUser({ ...nextPendingUser, requestId: result.requestId });
      setOtpCode("");
      setAuthMode("otp");
      setAuthNotice("");
      setRegisterForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      dispatch({
        type: "patch",
        patch: {
          authStatus: "otp_required",
          backendLive: true,
          toast: isArabic ? `Ø±Ù…Ø² Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠ ${DEMO_OTP}` : `Demo verification code ${DEMO_OTP}`
        }
      });
      return;
    } catch (error) {
      setAuthNotice("");
      setAuthError(authErrorMessage(error, copy.missing));
      dispatch({ type: "patch", patch: { authStatus: "error", backendLive: false } });
      return;
    }

    setPendingUser({
      fullName: cleanValue(registerForm.fullName),
      age: Number(registerForm.age),
      birthDate: cleanValue(registerForm.birthDate),
      city: cleanValue(registerForm.city),
      phone: cleanValue(registerForm.phone),
      requestId: ""
    });
    setOtpCode("");
    setAuthMode("otp");
    dispatch({
      type: "toast",
      message: isArabic ? `رمز التحقق التجريبي ${DEMO_OTP}` : `Demo verification code ${DEMO_OTP}`
    });
  }

  async function handleOtp(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    if (!pendingUser) {
      setAuthError(copy.missing);
      setAuthMode("register");
      return;
    }

    if (cleanValue(otpCode) !== DEMO_OTP) {
      setAuthError(copy.wrongOtp);
      return;
    }

    setAuthNotice(backendCopy.verifying);
    try {
      const result = await verifyOtp({ phone: pendingUser.phone, requestId: pendingUser.requestId, code: cleanValue(otpCode) });
      setVerifiedUser(result.user || pendingUser);
      setPendingUser(null);
      setLoginForm({ identifier: pendingUser.phone, password: "" });
      setAuthMode("login");
      setAuthNotice(copy.success);
      dispatch({ type: "patch", patch: { authStatus: "verified", backendLive: true, toast: copy.success } });
      return;
    } catch (error) {
      setAuthNotice("");
      setAuthError(authErrorMessage(error, copy.wrongOtp));
      dispatch({ type: "patch", patch: { authStatus: "error", backendLive: false } });
      return;
    }

    setVerifiedUser(pendingUser);
    setPendingUser(null);
    setLoginForm({ identifier: pendingUser.phone, password: "" });
    setAuthMode("login");
    setAuthNotice(copy.success);
    dispatch({ type: "toast", message: copy.success });
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    if (!cleanValue(loginForm.identifier) || !cleanValue(loginForm.password)) {
      setAuthError(copy.missing);
      return;
    }

    setAuthNotice(backendCopy.loggingIn);
    try {
      const result = await loginCustomer({ identifier: cleanValue(loginForm.identifier), password: loginForm.password });
      const user = result.user;
      setSessionToken(result.token, user.role || ROLES.customer);
      dispatch({
        type: "patch",
        patch: {
          role: user.role || ROLES.customer,
          session: { ...user, role: user.role || ROLES.customer, name: user.fullName || user.name, verified: true },
          currentUser: user,
          token: result.token,
          authStatus: "authenticated",
          phone: user.phone,
          cityId: user.city || user.cityId || state.cityId,
          backendLive: true,
          toast: copy.loginSuccess
        }
      });
      return;
    } catch (error) {
      setAuthNotice("");
      setAuthError(authErrorMessage(error, verifiedUser ? copy.wrongLogin : copy.noVerifiedAccount));
      dispatch({ type: "patch", patch: { authStatus: "error", backendLive: false } });
      return;
    }

    if (!verifiedUser) {
      setAuthError(copy.noVerifiedAccount);
      return;
    }

    if (!matchesVerifiedUser(loginForm.identifier, loginForm.password, verifiedUser)) {
      setAuthError(copy.wrongLogin);
      return;
    }

    dispatch({
      type: "patch",
      patch: {
        role: "customer",
        session: {
          role: "customer",
          name: verifiedUser.fullName,
          phone: verifiedUser.phone,
          verified: true
        },
        phone: verifiedUser.phone,
        cityId: verifiedUser.city || state.cityId,
        toast: copy.loginSuccess
      }
    });
  }

  function showSupportMessage(index) {
    setAuthError("");
    setAuthNotice("");
    dispatch({ type: "toast", message: copy.supportMessages[index] });
  }

  function openCaptainApplication() {
    setAuthError("");
    setAuthNotice("");
    setCaptainApplicationOpen(true);
  }

  const supportItems = [...copy.support, copy.captainJoin];

  return (
    <main className={`welcome-auth auth-mode-${authMode}`} data-auth-states="auth-mode-login auth-mode-register auth-mode-otp">
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
              onClick={() => (index === copy.support.length ? openCaptainApplication() : showSupportMessage(index))}
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
            <button className="primary auth-submit" type="submit" disabled={isMutating}>{isMutating ? backendCopy.loggingIn : (isArabic ? "دخول إلى التطبيق" : "Enter app")}</button>
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
              <AuthField label={isArabic ? "العمر" : "Age"} name="age" type="number" min={MIN_CUSTOMER_AGE} max={MAX_CUSTOMER_AGE} value={registerForm.age} onChange={(value) => updateRegister("age", value)} inputMode="numeric" />
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
            <button className="primary auth-submit" type="submit" disabled={isMutating}>{isMutating ? backendCopy.registering : (isArabic ? "إنشاء الحساب" : "Create account")}</button>
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
              <strong>{DEMO_OTP}</strong>
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
              <button className="primary" type="submit" disabled={isMutating}>{isMutating ? backendCopy.verifying : (isArabic ? "تحقق" : "Verify")}</button>
            </div>
          </form>
        )}

        {authNotice && authMode !== "login" && <p className="auth-notice">{authNotice}</p>}
      </section>
      {captainApplicationOpen && (
        <CaptainApplicationPanel
          state={state}
          dispatch={dispatch}
          isArabic={isArabic}
          onClose={() => setCaptainApplicationOpen(false)}
        />
      )}
      <Toast message={state.toast} />
    </main>
  );
}
