import { useState } from "react";
import { useCaptainApplications } from "../../hooks/useCaptainApplications.js";
import { AuthField } from "../auth/AuthField.jsx";

const MIN_CAPTAIN_AGE = 18;
const MAX_CAPTAIN_AGE = 75;
const MAX_EXPERIENCE_YEARS = 60;

function cleanValue(value) {
  return String(value || "").trim();
}

function isReasonableCaptainAge(value) {
  const ageNumber = Number(value);
  return Number.isInteger(ageNumber) && ageNumber >= MIN_CAPTAIN_AGE && ageNumber <= MAX_CAPTAIN_AGE;
}

function isOptionalExperienceValid(value) {
  const normalizedValue = cleanValue(value);
  if (!normalizedValue) return true;
  const years = Number(normalizedValue);
  return Number.isInteger(years) && years >= 0 && years <= MAX_EXPERIENCE_YEARS;
}

function createCaptainApplication(form, cityLabel) {
  return {
    id: `captain_app_${Date.now()}`,
    fullName: cleanValue(form.fullName),
    phone: cleanValue(form.phone),
    city: cleanValue(form.city),
    cityLabel,
    age: Number(form.age),
    vehicleType: cleanValue(form.vehicleType),
    vehiclePlate: cleanValue(form.vehiclePlate),
    experienceYears: cleanValue(form.experienceYears) ? Number(form.experienceYears) : "",
    notes: cleanValue(form.notes),
    status: "pending",
    createdAt: new Date().toISOString()
  };
}

function upsertCaptainApplication(applications, application) {
  const existingIndex = applications.findIndex((item) => item.id === application.id);
  if (existingIndex === -1) return [...applications, application];
  return applications.map((item) => (item.id === application.id ? application : item));
}

export function CaptainApplicationPanel({ state, dispatch, isArabic, onClose }) {
  const { createApplication, isMutating } = useCaptainApplications({ enabled: false });
  const [captainApplicationForm, setCaptainApplicationForm] = useState({
    fullName: "",
    phone: state.phone,
    city: state.cityId,
    age: "",
    vehicleType: "",
    vehiclePlate: "",
    experienceYears: "",
    notes: ""
  });
  const [applicationError, setApplicationError] = useState("");
  const [applicationNotice, setApplicationNotice] = useState("");
  const [submittedApplication, setSubmittedApplication] = useState(null);

  const copy = isArabic
    ? {
        title: "طلب انضمام كابتن توصيل",
        intro: "املأ بياناتك الأساسية وسيبقى الطلب قيد المراجعة حتى توافق الإدارة.",
        review: "هذا النموذج لا يفتح لوحة السائق ولا ينشئ حساب كابتن مباشرة.",
        success: "تم إرسال طلبك بنجاح. سيتم مراجعة بياناتك من الإدارة والتواصل معك.",
        missing: "يرجى تعبئة الاسم ورقم الهاتف والمدينة والعمر ونوع المركبة.",
        invalidAge: "العمر يجب أن يكون رقمًا منطقيًا بين 18 و75.",
        invalidExperience: "سنوات الخبرة يجب أن تكون رقمًا بين 0 و60 أو تُترك فارغة.",
        pending: "قيد المراجعة",
        close: "العودة للدخول",
        send: "إرسال الطلب",
        another: "طلب جديد",
        cityLabel: "المدينة",
        vehicleOptions: [
          ["", "اختر نوع المركبة"],
          ["car", "سيارة"],
          ["motorcycle", "دراجة نارية"],
          ["van", "فان / مركبة توصيل"]
        ]
      }
    : {
        title: "Captain application",
        intro: "Add your basic details and the request will stay pending until management approves it.",
        review: "This form does not open the driver dashboard or create a captain account directly.",
        success: "Your request was sent successfully. Management will review your details and contact you.",
        missing: "Please fill name, phone, city, age, and vehicle type.",
        invalidAge: "Age must be a reasonable number between 18 and 75.",
        invalidExperience: "Experience years must be a number between 0 and 60 or left empty.",
        pending: "Pending review",
        close: "Back to login",
        send: "Send application",
        another: "New application",
        cityLabel: "City",
        vehicleOptions: [
          ["", "Select vehicle type"],
          ["car", "Car"],
          ["motorcycle", "Motorcycle"],
          ["van", "Van"]
        ]
      };

  const localFallbackMessage = isArabic
    ? "تعذر الاتصال بالـ Backend، تم حفظ طلبك محليًا مؤقتًا للمراجعة."
    : "Backend is not reachable, so the application was saved locally for now.";
  const sendingMessage = isArabic ? "جاري إرسال الطلب..." : "Sending application...";

  function updateCaptainApplication(field, value) {
    setCaptainApplicationForm((current) => ({ ...current, [field]: value }));
    setApplicationError("");
  }

  function resetApplicationForm() {
    setSubmittedApplication(null);
    setApplicationNotice("");
    setApplicationError("");
    setCaptainApplicationForm({
      fullName: "",
      phone: state.phone,
      city: state.cityId,
      age: "",
      vehicleType: "",
      vehiclePlate: "",
      experienceYears: "",
      notes: ""
    });
  }

  async function handleCaptainApplicationSubmit(event) {
    event.preventDefault();
    setApplicationError("");
    setApplicationNotice("");

    const requiredFields = ["fullName", "phone", "city", "age", "vehicleType"];
    const hasMissingField = requiredFields.some((field) => !cleanValue(captainApplicationForm[field]));
    if (hasMissingField) {
      setApplicationError(copy.missing);
      return;
    }

    if (!isReasonableCaptainAge(captainApplicationForm.age)) {
      setApplicationError(copy.invalidAge);
      return;
    }

    if (!isOptionalExperienceValid(captainApplicationForm.experienceYears)) {
      setApplicationError(copy.invalidExperience);
      return;
    }

    const selectedCity = state.cities.find((city) => city.id === captainApplicationForm.city);
    const application = createCaptainApplication(
      captainApplicationForm,
      selectedCity ? (isArabic ? selectedCity.ar : selectedCity.en) : captainApplicationForm.city
    );

    setApplicationNotice(sendingMessage);
    try {
      const result = await createApplication(application);
      const submitted = result?.application || application;
      dispatch({
        type: "patch",
        patch: {
          pendingCaptainApplications: upsertCaptainApplication(state.pendingCaptainApplications || [], submitted),
          backendLive: true,
          toast: copy.success
        }
      });
      setSubmittedApplication(submitted);
      setApplicationNotice(copy.success);
    } catch (error) {
      const backendError = error?.message || "Backend unavailable";
      const localApplication = { ...application, backendError };
      dispatch({
        type: "patch",
        patch: {
          pendingCaptainApplications: upsertCaptainApplication(state.pendingCaptainApplications || [], localApplication),
          backendLive: false,
          toast: localFallbackMessage
        }
      });
      setSubmittedApplication(localApplication);
      setApplicationNotice(localFallbackMessage);
    }
  }

  return (
    <div className="captain-application-modal" role="dialog" aria-modal="true" aria-label={copy.title}>
      <div className="captain-application-panel">
        <div className="captain-application-header">
          <div>
            <span>{copy.pending}</span>
            <h2>{copy.title}</h2>
            <p>{copy.intro}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label={copy.close}>
            ×
          </button>
        </div>

        <div className="captain-review-note">
          <span>{copy.pending}</span>
          <strong>{copy.review}</strong>
        </div>

        {submittedApplication ? (
          <div className="captain-application-summary">
            <strong>{applicationNotice || copy.success}</strong>
            <dl>
              <div>
                <dt>{isArabic ? "الاسم" : "Name"}</dt>
                <dd>{submittedApplication.fullName}</dd>
              </div>
              <div>
                <dt>{isArabic ? "الهاتف" : "Phone"}</dt>
                <dd>{submittedApplication.phone}</dd>
              </div>
              <div>
                <dt>{copy.cityLabel}</dt>
                <dd>{submittedApplication.cityLabel}</dd>
              </div>
              <div>
                <dt>{isArabic ? "الحالة" : "Status"}</dt>
                <dd>{copy.pending}</dd>
              </div>
            </dl>
            <div className="auth-actions">
              <button className="secondary" type="button" onClick={resetApplicationForm}>{copy.another}</button>
              <button className="primary" type="button" onClick={onClose}>{copy.close}</button>
            </div>
          </div>
        ) : (
          <form className="captain-application-form" onSubmit={handleCaptainApplicationSubmit}>
            <div className="auth-field-grid">
              <AuthField label={isArabic ? "الاسم الكامل" : "Full name"} name="captainFullName" value={captainApplicationForm.fullName} onChange={(value) => updateCaptainApplication("fullName", value)} autoComplete="name" />
              <AuthField label={isArabic ? "رقم الهاتف" : "Phone number"} name="captainPhone" type="tel" value={captainApplicationForm.phone} onChange={(value) => updateCaptainApplication("phone", value)} autoComplete="tel" />
              <label className="field auth-field">
                <span>{copy.cityLabel}</span>
                <select name="captainCity" value={captainApplicationForm.city} onChange={(event) => updateCaptainApplication("city", event.target.value)}>
                  {state.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {isArabic ? city.ar : city.en}
                    </option>
                  ))}
                </select>
              </label>
              <AuthField label={isArabic ? "العمر" : "Age"} name="captainAge" type="number" min={MIN_CAPTAIN_AGE} max={MAX_CAPTAIN_AGE} value={captainApplicationForm.age} onChange={(value) => updateCaptainApplication("age", value)} inputMode="numeric" />
              <label className="field auth-field">
                <span>{isArabic ? "نوع المركبة" : "Vehicle type"}</span>
                <select name="captainVehicleType" value={captainApplicationForm.vehicleType} onChange={(event) => updateCaptainApplication("vehicleType", event.target.value)}>
                  {copy.vehicleOptions.map(([value, label]) => (
                    <option key={value || "empty"} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <AuthField label={isArabic ? "رقم المركبة أو اللوحة إن وجد" : "Vehicle or plate number if available"} name="captainVehiclePlate" value={captainApplicationForm.vehiclePlate} onChange={(value) => updateCaptainApplication("vehiclePlate", value)} />
              <AuthField label={isArabic ? "سنوات الخبرة، اختياري" : "Experience years, optional"} name="captainExperienceYears" type="number" min="0" max={MAX_EXPERIENCE_YEARS} value={captainApplicationForm.experienceYears} onChange={(value) => updateCaptainApplication("experienceYears", value)} inputMode="numeric" />
              <label className="field auth-field captain-notes-field">
                <span>{isArabic ? "ملاحظات إضافية، اختياري" : "Additional notes, optional"}</span>
                <textarea
                  name="captainNotes"
                  value={captainApplicationForm.notes}
                  onChange={(event) => updateCaptainApplication("notes", event.target.value)}
                  rows="4"
                />
              </label>
            </div>
            {applicationNotice && <p className="auth-notice">{applicationNotice}</p>}
            {applicationError && <p className="auth-error">{applicationError}</p>}
            <div className="auth-actions">
              <button className="secondary" type="button" onClick={onClose}>{copy.close}</button>
              <button className="primary" type="submit" disabled={isMutating}>{isMutating ? sendingMessage : copy.send}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
