import { useEffect, useState } from "react";
import { createSupportTicket, fetchMySupportTickets } from "../services/supportApi";
import { useMobileApp } from "../store/mobileStore";
import { apiErrorMessage } from "../utils/errorUtils";

const customerIssueTypes = [
  { value: "ride_issue", label: "مشكلة في الرحلة" },
  { value: "payment_issue", label: "مشكلة في الدفع" },
  { value: "captain_issue", label: "مشكلة مع كابتن" },
  { value: "account_issue", label: "مشكلة في الحساب" },
  { value: "note", label: "ملاحظة" }
];

const driverIssueTypes = [
  { value: "ride_issue", label: "مشكلة في رحلة" },
  { value: "earnings_issue", label: "مشكلة في الأرباح" },
  { value: "gps_issue", label: "مشكلة في التتبع" },
  { value: "account_issue", label: "مشكلة في الحساب" }
];

function statusTone(status) {
  return status === "closed" ? "success" : "warning";
}

function statusLabel(status) {
  return status === "closed" ? "مغلقة" : "مفتوحة";
}

const defaults = {
  customer: {
    issueTypes: customerIssueTypes,
    role: "customer",
    loadMode: "silent-empty",
    submitSuccess: "تم إرسال تذكرة الدعم بنجاح.",
    submitError: "تعذر إرسال التذكرة."
  },
  driver: {
    issueTypes: driverIssueTypes,
    role: "driver",
    loadMode: "error",
    loadError: "تعذر تحميل تذاكر الدعم.",
    submitSuccess: "تم إرسال طلب الدعم بنجاح.",
    submitError: "تعذر إرسال طلب الدعم."
  }
};

export function useSupportTickets({ role = "customer" } = {}) {
  const { state } = useMobileApp();
  const options = defaults[role] || defaults.customer;
  const [type, setType] = useState("ride_issue");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const session = { token: state.token, role: options.role, phone: state.currentUser?.phone };

  function loadTickets() {
    if (options.role === "driver" && !session.phone) return;
    setLoading(true);
    if (options.loadMode === "error") setError("");
    fetchMySupportTickets(session)
      .then(setTickets)
      .catch((requestError) => {
        if (options.loadMode === "error") {
          setError(apiErrorMessage(requestError, options.loadError));
        } else {
          setTickets([]);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadTickets, [state.currentUser?.phone, state.token]);

  async function submit() {
    if (options.role === "customer") {
      setError("");
      setSuccess("");
      if (!message.trim()) return;
    } else {
      if (!message.trim()) return;
      setError("");
      setSuccess("");
    }
    try {
      const selectedType = options.issueTypes.find((item) => item.value === type);
      await createSupportTicket({ name: state.currentUser?.fullName, phone: state.currentUser?.phone, role: options.role, type: selectedType?.label || type, message: message.trim() }, session);
      setMessage("");
      setSuccess(options.submitSuccess);
      loadTickets();
    } catch (requestError) {
      setError(apiErrorMessage(requestError, options.submitError));
    }
  }

  return {
    type,
    setType,
    message,
    setMessage,
    tickets,
    loading,
    error,
    success,
    issueTypes: options.issueTypes,
    loadTickets,
    submit,
    statusTone,
    statusLabel
  };
}
