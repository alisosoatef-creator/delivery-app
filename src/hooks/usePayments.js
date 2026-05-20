import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPaymentMethod,
  deletePaymentMethod,
  fetchAdminPayments,
  fetchCustomerPayments,
  fetchCustomerWallet,
  fetchDriverEarnings,
  fetchDriverWalletTransactions,
  fetchPaymentMethods,
  payRide,
  updateAdminPaymentStatus
} from "../services/paymentsApi.js";

export function usePayments({
  enabled = true,
  userId = "",
  phone = "",
  role = "customer",
  driverId = "",
  adminEnabled = false
} = {}) {
  const queryClient = useQueryClient();
  const customerEnabled = enabled && role === "customer" && Boolean(userId || phone);
  const driverEnabled = enabled && role === "driver" && Boolean(driverId || phone);

  const walletQuery = useQuery({
    queryKey: ["customer", "wallet", userId || phone],
    queryFn: () => fetchCustomerWallet({ userId, phone }),
    enabled: customerEnabled,
    staleTime: 15_000
  });

  const customerPaymentsQuery = useQuery({
    queryKey: ["customer", "payments", userId || phone],
    queryFn: () => fetchCustomerPayments({ userId, phone }),
    enabled: customerEnabled,
    staleTime: 15_000
  });

  const paymentMethodsQuery = useQuery({
    queryKey: ["customer", "paymentMethods", userId || phone],
    queryFn: () => fetchPaymentMethods({ userId, phone }),
    enabled: customerEnabled,
    staleTime: 30_000
  });

  const adminPaymentsQuery = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: fetchAdminPayments,
    enabled: enabled && adminEnabled,
    staleTime: 10_000
  });

  const driverEarningsQuery = useQuery({
    queryKey: ["driver", "earnings", driverId || phone],
    queryFn: () => fetchDriverEarnings({ driverId, phone }),
    enabled: driverEnabled,
    staleTime: 10_000
  });

  const driverWalletTransactionsQuery = useQuery({
    queryKey: ["driver", "walletTransactions", driverId || phone],
    queryFn: () => fetchDriverWalletTransactions({ driverId, phone }),
    enabled: driverEnabled,
    staleTime: 10_000
  });

  function invalidatePaymentQueries() {
    queryClient.invalidateQueries({ queryKey: ["customer", "wallet"] });
    queryClient.invalidateQueries({ queryKey: ["customer", "payments"] });
    queryClient.invalidateQueries({ queryKey: ["customer", "paymentMethods"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["driver", "earnings"] });
    queryClient.invalidateQueries({ queryKey: ["driver", "walletTransactions"] });
  }

  const addPaymentMethodMutation = useMutation({
    mutationFn: addPaymentMethod,
    onSuccess: invalidatePaymentQueries
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: (methodId) => deletePaymentMethod(methodId, { userId, phone }),
    onSuccess: invalidatePaymentQueries
  });

  const payRideMutation = useMutation({
    mutationFn: payRide,
    onSuccess: invalidatePaymentQueries
  });

  const updateAdminPaymentStatusMutation = useMutation({
    mutationFn: ({ paymentId, status }) => updateAdminPaymentStatus(paymentId, status),
    onSuccess: invalidatePaymentQueries
  });

  const backendError =
    walletQuery.error ||
    customerPaymentsQuery.error ||
    paymentMethodsQuery.error ||
    adminPaymentsQuery.error ||
    driverEarningsQuery.error ||
    driverWalletTransactionsQuery.error ||
    addPaymentMethodMutation.error ||
    deletePaymentMethodMutation.error ||
    payRideMutation.error ||
    updateAdminPaymentStatusMutation.error ||
    null;

  return {
    wallet: walletQuery.data || { balance: 0, balanceIls: 0, transactions: [], currency: "ILS" },
    customerPayments: customerPaymentsQuery.data || [],
    paymentMethods: paymentMethodsQuery.data || [],
    adminPayments: adminPaymentsQuery.data?.payments || [],
    adminWalletTransactions: adminPaymentsQuery.data?.walletTransactions || [],
    adminPaymentSummary: adminPaymentsQuery.data?.summary || null,
    driverEarnings: driverEarningsQuery.data || { summary: null, payments: [], transactions: [] },
    driverWalletTransactions: driverWalletTransactionsQuery.data || [],
    backendError,
    addPaymentMethod: addPaymentMethodMutation.mutateAsync,
    deletePaymentMethod: deletePaymentMethodMutation.mutateAsync,
    payRide: payRideMutation.mutateAsync,
    updateAdminPaymentStatus: updateAdminPaymentStatusMutation.mutateAsync,
    refetchWallet: walletQuery.refetch,
    refetchCustomerPayments: customerPaymentsQuery.refetch,
    refetchAdminPayments: adminPaymentsQuery.refetch,
    refetchDriverEarnings: driverEarningsQuery.refetch,
    refetchDriverWalletTransactions: driverWalletTransactionsQuery.refetch,
    isLoading:
      walletQuery.isLoading ||
      customerPaymentsQuery.isLoading ||
      paymentMethodsQuery.isLoading ||
      adminPaymentsQuery.isLoading ||
      driverEarningsQuery.isLoading ||
      driverWalletTransactionsQuery.isLoading,
    isMutating:
      addPaymentMethodMutation.isPending ||
      deletePaymentMethodMutation.isPending ||
      payRideMutation.isPending ||
      updateAdminPaymentStatusMutation.isPending
  };
}
