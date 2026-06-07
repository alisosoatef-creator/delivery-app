import { useState } from "react";
import { loginCustomer } from "../services/authApi";
import { saveMobileSession } from "../services/sessionStorage";
import { useMobileApp } from "../store/mobileStore";
import { apiErrorMessage, connectionMessageFor } from "../utils/errorUtils";

export function useCustomerLogin() {
  const { dispatch } = useMobileApp();
  const isDev = typeof __DEV__ !== "undefined" && __DEV__;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setStatus("loading");
    try {
      const payload = await loginCustomer({ identifier, password });
      await saveMobileSession({
        token: payload.token,
        role: payload.user?.role || "customer",
        currentUser: payload.user,
        session: { ...payload.user, token: payload.token },
        phone: payload.user?.phone,
        userId: payload.user?.id
      });
      dispatch({
        type: "login",
        token: payload.token,
        role: payload.user?.role || "customer",
        user: payload.user,
        session: { ...payload.user, token: payload.token },
        toast: "تم تسجيل الدخول بنجاح."
      });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "تعذر تسجيل الدخول."));
      dispatch({ type: "patch", patch: { connectionMessage: connectionMessageFor(requestError) } });
    } finally {
      setStatus("idle");
    }
  }

  function goToRegister() {
    dispatch({ type: "navigate", area: "auth", screen: "register" });
  }

  function goToDevDriverLogin() {
    dispatch({ type: "navigate", area: "driver", screen: "dev-login" });
  }

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    status,
    error,
    isDev,
    submit,
    goToRegister,
    goToDevDriverLogin
  };
}
