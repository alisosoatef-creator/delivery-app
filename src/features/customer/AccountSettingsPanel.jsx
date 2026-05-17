import { useState } from "react";

export function AccountSettingsPanel({ state, dispatch, t, isArabic, onClose }) {
  function notify(messageAr, messageEn) {
    dispatch({ type: "toast", message: isArabic ? messageAr : messageEn });
  }

  const [settingsDraft, setSettingsDraft] = useState({
    fullName: state.session?.name || "",
    phone: state.session?.phone || state.phone || "",
    cityId: state.cityId,
    avatar: state.profileAvatar || "",
    password: "",
    homeAddress: state.savedAddresses?.home || "",
    workAddress: state.savedAddresses?.work || "",
    universityAddress: state.savedAddresses?.university || "",
    defaultPayment: state.paymentMethod === "visa" ? "visa" : "cash",
    notificationsEnabled: state.notificationsEnabled !== false,
    themeMode: state.themeMode || "system"
  });

  function updateDraft(field, value) {
    setSettingsDraft((draft) => ({ ...draft, [field]: value }));
  }

  function saveSettings() {
    dispatch({
      type: "patch",
      patch: {
        session: {
          ...(state.session || { role: "customer" }),
          name: settingsDraft.fullName.trim() || state.session?.name,
          phone: settingsDraft.phone.trim() || state.session?.phone || state.phone
        },
        phone: settingsDraft.phone.trim() || state.phone,
        cityId: settingsDraft.cityId,
        profileAvatar: settingsDraft.avatar.trim(),
        savedAddresses: {
          home: settingsDraft.homeAddress.trim(),
          work: settingsDraft.workAddress.trim(),
          university: settingsDraft.universityAddress.trim()
        },
        paymentMethod: settingsDraft.defaultPayment,
        notificationsEnabled: settingsDraft.notificationsEnabled,
        themeMode: settingsDraft.themeMode,
        toast: isArabic ? "تم حفظ الإعدادات محليًا داخل التطبيق." : "Settings saved locally in the app."
      }
    });
  }

  function updateCurrentLocation() {
    if (!("geolocation" in navigator)) {
      notify("المتصفح لا يدعم تحديث الموقع الحالي.", "This browser cannot update the current location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch({
          type: "patch",
          patch: {
            customerLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            locationStatus: "granted",
            toast: isArabic ? "تم تحديث موقعك الحالي محليًا." : "Current location updated locally."
          }
        });
      },
      () => notify("لم يتم السماح بتحديث الموقع، سنبقي موقع نابلس الافتراضي.", "Location permission was not granted, so the Nablus default remains.")
    );
  }

  return (
    <section className="account-settings-drawer account-settings-panel" onMouseDown={(event) => event.stopPropagation()}>
      <div className="settings-drawer-head">
        <div>
          <span>{isArabic ? "لوحة مستقلة" : "Separate panel"}</span>
          <h2>{isArabic ? "إعدادات الحساب" : "Account settings"}</h2>
          <p className="settings-local-note">
            {isArabic
              ? "هذه الإعدادات محفوظة مؤقتًا في الواجهة فقط حتى يتم ربط حفظ الحساب بالـ Backend."
              : "These settings are temporarily stored in local app state until account persistence is connected."}
          </p>
        </div>
        <button className="icon-button settings-close-button" type="button" onClick={onClose} aria-label={isArabic ? "إغلاق الإعدادات" : "Close settings"}>
          ×
        </button>
      </div>

      <div className="settings-section-stack">
        <section className="settings-section account-info-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "معلومات الحساب" : "Account information"}</strong>
            <small>{isArabic ? "الاسم، الهاتف، الصورة، وكلمة المرور" : "Name, phone, avatar, and password"}</small>
          </div>
          <div className="settings-form-grid">
            <label className="field">
              <span>{isArabic ? "تعديل الاسم" : "Edit name"}</span>
              <input name="settingsFullName" value={settingsDraft.fullName} onChange={(event) => updateDraft("fullName", event.target.value)} />
            </label>
            <label className="field">
              <span>{isArabic ? "تعديل رقم الهاتف" : "Edit phone number"}</span>
              <input name="settingsPhone" value={settingsDraft.phone} onChange={(event) => updateDraft("phone", event.target.value)} />
            </label>
            <label className="field">
              <span>{isArabic ? "تعديل المدينة" : "Edit city"}</span>
              <select value={settingsDraft.cityId} onChange={(event) => updateDraft("cityId", event.target.value)}>
                {state.cities.map((city) => (
                  <option key={city.id} value={city.id}>{isArabic ? city.ar : city.en}</option>
                ))}
              </select>
            </label>
            <label className="field avatar-field">
              <span>{isArabic ? "تعديل الصورة الشخصية أو Avatar" : "Edit profile avatar"}</span>
              <input name="settingsAvatar" maxLength={2} value={settingsDraft.avatar} onChange={(event) => updateDraft("avatar", event.target.value)} placeholder={isArabic ? "حرفان" : "Initials"} />
            </label>
            <label className="field">
              <span>{isArabic ? "تغيير كلمة المرور" : "Change password"}</span>
              <input name="settingsPassword" type="password" value={settingsDraft.password} onChange={(event) => updateDraft("password", event.target.value)} placeholder={isArabic ? "واجهة محلية مؤقتة" : "Local placeholder"} />
            </label>
          </div>
        </section>

        <section className="settings-section location-addresses-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "الموقع والعناوين" : "Location and addresses"}</strong>
            <small>{isArabic ? "الموقع الحالي والعناوين المحفوظة" : "Current location and saved addresses"}</small>
          </div>
          <button className="secondary update-current-location" type="button" onClick={updateCurrentLocation}>
            {isArabic ? "تحديث الموقع الحالي" : "Update current location"}
          </button>
          <div className="settings-form-grid">
            <label className="field">
              <span>{isArabic ? "البيت" : "Home"}</span>
              <input name="homeAddress" value={settingsDraft.homeAddress} onChange={(event) => updateDraft("homeAddress", event.target.value)} placeholder={isArabic ? "أضف عنوان البيت" : "Add home address"} />
            </label>
            <label className="field">
              <span>{isArabic ? "العمل" : "Work"}</span>
              <input name="workAddress" value={settingsDraft.workAddress} onChange={(event) => updateDraft("workAddress", event.target.value)} placeholder={isArabic ? "أضف عنوان العمل" : "Add work address"} />
            </label>
            <label className="field">
              <span>{isArabic ? "الجامعة" : "University"}</span>
              <input name="universityAddress" value={settingsDraft.universityAddress} onChange={(event) => updateDraft("universityAddress", event.target.value)} placeholder={isArabic ? "أضف عنوان الجامعة" : "Add university address"} />
            </label>
            <label className="field">
              <span>{isArabic ? "اختيار المدينة الافتراضية" : "Choose default city"}</span>
              <select value={settingsDraft.cityId} onChange={(event) => updateDraft("cityId", event.target.value)}>
                {state.cities.map((city) => (
                  <option key={city.id} value={city.id}>{isArabic ? city.ar : city.en}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="settings-section payment-settings-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "الدفع" : "Payment"}</strong>
            <small>{isArabic ? "إدارة طرق الدفع الافتراضية" : "Manage default payment methods"}</small>
          </div>
          <div className="settings-payment-row">
            <div className="settings-visa-placeholder">
              <span>VISA</span>
              <strong>{state.visaCardPreview || "•••• 4582"}</strong>
              <small>{isArabic ? "إضافة بطاقة VISA كواجهة فقط بدون دفع حقيقي" : "Add VISA as a UI-only placeholder"}</small>
            </div>
            <div className="default-payment-choice segmented">
              <button type="button" className={settingsDraft.defaultPayment === "cash" ? "active" : ""} onClick={() => updateDraft("defaultPayment", "cash")}>{t.cash}</button>
              <button type="button" className={settingsDraft.defaultPayment === "visa" ? "active" : ""} onClick={() => updateDraft("defaultPayment", "visa")}>VISA</button>
            </div>
          </div>
        </section>

        <section className="settings-section app-settings-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "التطبيق" : "App"}</strong>
            <small>{isArabic ? "اللغة، الإشعارات، والمظهر" : "Language, notifications, and appearance"}</small>
          </div>
          <div className="settings-row">
            <span><small>{isArabic ? "اللغة" : "Language"}</small><strong>{isArabic ? "عربي" : "English"}</strong></span>
            <button className="secondary" type="button" onClick={() => dispatch({ type: "patch", patch: { language: state.language === "ar" ? "en" : "ar" } })}>
              {state.language === "ar" ? "English" : "عربي"}
            </button>
          </div>
          <label className="settings-row settings-toggle-row">
            <span><small>{isArabic ? "الإشعارات" : "Notifications"}</small><strong>{settingsDraft.notificationsEnabled ? (isArabic ? "مفعلة" : "Enabled") : (isArabic ? "متوقفة" : "Disabled")}</strong></span>
            <input type="checkbox" checked={settingsDraft.notificationsEnabled} onChange={(event) => updateDraft("notificationsEnabled", event.target.checked)} />
          </label>
          <div className="settings-row">
            <span><small>{isArabic ? "الوضع الداكن/الفاتح" : "Dark/light mode"}</small><strong>{settingsDraft.themeMode === "dark" ? (isArabic ? "داكن" : "Dark") : settingsDraft.themeMode === "light" ? (isArabic ? "فاتح" : "Light") : (isArabic ? "حسب النظام" : "System")}</strong></span>
            <div className="theme-choice segmented">
              <button type="button" className={settingsDraft.themeMode === "light" ? "active" : ""} onClick={() => updateDraft("themeMode", "light")}>{isArabic ? "فاتح" : "Light"}</button>
              <button type="button" className={settingsDraft.themeMode === "dark" ? "active" : ""} onClick={() => updateDraft("themeMode", "dark")}>{isArabic ? "داكن" : "Dark"}</button>
            </div>
          </div>
        </section>

        <section className="settings-section support-settings-section">
          <div className="section-mini-title">
            <strong>{isArabic ? "الدعم" : "Support"}</strong>
            <small>{isArabic ? "تواصل، مساعدة، أو بلاغ" : "Contact, help, or report"}</small>
          </div>
          <div className="settings-support-actions">
            <button className="secondary" type="button" onClick={() => notify("سيتم توجيه طلبك للإدارة في النسخة المتصلة.", "Your request will be routed to management in the connected build.")}>{isArabic ? "تواصل مع الإدارة" : "Contact management"}</button>
            <button className="secondary" type="button" onClick={() => notify("مركز المساعدة قيد التجهيز داخل التطبيق.", "The help center is being prepared inside the app.")}>{isArabic ? "مركز المساعدة" : "Help center"}</button>
            <button className="secondary danger-soft" type="button" onClick={() => notify("تم تسجيل البلاغ محليًا للتجربة.", "Issue report saved locally for the demo.")}>{isArabic ? "الإبلاغ عن مشكلة" : "Report an issue"}</button>
          </div>
        </section>
      </div>

      <div className="settings-drawer-actions">
        <button className="secondary" type="button" onClick={onClose}>{isArabic ? "إغلاق" : "Close"}</button>
        <button className="primary" type="button" onClick={saveSettings}>{isArabic ? "حفظ الإعدادات" : "Save settings"}</button>
      </div>
    </section>
  );

}
