import { logoutCustomer } from "../services/authApi";
import { clearMobileSession } from "../services/sessionStorage";
import { disconnectMobileSocket } from "../services/socketClient";
import { useMobileApp } from "../store/mobileStore";

export function useLogout() {
  const { state, dispatch } = useMobileApp();
  const user = state.currentUser || {};

  async function logout() {
    try {
      await logoutCustomer(state.token);
    } catch {
      // Local cleanup remains required even when the development backend is offline.
    }
    disconnectMobileSocket();
    await clearMobileSession();
    dispatch({ type: "logout", toast: "تم تسجيل الخروج." });
  }

  function navigateToWallet() {
    dispatch({ type: "navigate", area: "customer", screen: "wallet" });
  }

  function navigateToSupport() {
    dispatch({ type: "navigate", area: "customer", screen: "support" });
  }

  return {
    user,
    selectedCity: state.selectedCity,
    logout,
    navigateToWallet,
    navigateToSupport
  };
}
