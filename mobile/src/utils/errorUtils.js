export function apiErrorMessage(error, fallback = "تعذر تنفيذ الطلب.") {
  if (error?.kind === "network_error") return "لا يمكن الاتصال بالخادم حاليًا. تحقق من الشبكة أو API URL.";
  if (error?.kind === "auth_error") return "انتهت الجلسة أو لا تملك صلاحية لهذا الطلب.";
  if (error?.kind === "validation_error") return error.message || "تحقق من البيانات المدخلة.";
  if (error?.kind === "not_found") return "العنصر المطلوب غير موجود.";
  if (error?.kind === "server_error") return "حدث خطأ في الخادم. حاول لاحقًا.";
  return error?.message || fallback;
}

export function connectionMessageFor(error) {
  if (error?.kind === "network_error") return "لا يمكن الاتصال بالخادم حاليًا.";
  if (error?.kind === "auth_error") return "صلاحية الجلسة غير صالحة. سجل الدخول من جديد إذا استمرت المشكلة.";
  return "";
}
