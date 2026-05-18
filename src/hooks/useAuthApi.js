import { useMutation } from "@tanstack/react-query";
import { loginCustomer, logoutCustomer, registerCustomer, verifyOtp } from "../services/authApi.js";

export function useAuthApi() {
  const registerMutation = useMutation({ mutationFn: registerCustomer });
  const verifyOtpMutation = useMutation({ mutationFn: verifyOtp });
  const loginMutation = useMutation({ mutationFn: loginCustomer });
  const logoutMutation = useMutation({ mutationFn: logoutCustomer });
  const backendError =
    registerMutation.error ||
    verifyOtpMutation.error ||
    loginMutation.error ||
    logoutMutation.error ||
    null;

  return {
    registerCustomer: registerMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    loginCustomer: loginMutation.mutateAsync,
    logoutCustomer: logoutMutation.mutateAsync,
    backendError,
    isMutating:
      registerMutation.isPending ||
      verifyOtpMutation.isPending ||
      loginMutation.isPending ||
      logoutMutation.isPending
  };
}
