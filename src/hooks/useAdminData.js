import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminCustomers,
  fetchAdminDashboard,
  fetchAdminDrivers,
  fetchAdminRides,
  fetchAdminSettings,
  cleanupAdminRecords,
  updateAdminCustomerStatus,
  updateAdminDriverStatus,
  updateAdminSettings
} from "../services/adminApi.js";
import { fetchPricingRules, updatePricingRule } from "../services/pricingApi.js";
import { fetchSupportTickets, updateSupportTicketStatus } from "../services/supportApi.js";

export function useAdminData({ enabled = true } = {}) {
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    enabled,
    staleTime: 10_000
  });
  const customersQuery = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: fetchAdminCustomers,
    enabled,
    staleTime: 15_000
  });
  const driversQuery = useQuery({
    queryKey: ["admin", "drivers"],
    queryFn: fetchAdminDrivers,
    enabled,
    staleTime: 15_000
  });
  const ridesQuery = useQuery({
    queryKey: ["admin", "rides"],
    queryFn: fetchAdminRides,
    enabled,
    staleTime: 10_000
  });
  const supportQuery = useQuery({
    queryKey: ["admin", "supportTickets"],
    queryFn: fetchSupportTickets,
    enabled,
    staleTime: 15_000
  });
  const pricingQuery = useQuery({
    queryKey: ["admin", "pricingRules"],
    queryFn: fetchPricingRules,
    enabled,
    staleTime: 30_000
  });
  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
    enabled,
    staleTime: 30_000
  });

  const updateCustomerStatusMutation = useMutation({
    mutationFn: ({ customerId, status }) => updateAdminCustomerStatus(customerId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  const updateDriverStatusMutation = useMutation({
    mutationFn: ({ driverId, patch }) => updateAdminDriverStatus(driverId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  const closeSupportTicketMutation = useMutation({
    mutationFn: ({ ticketId, status = "closed" }) => updateSupportTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "supportTickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  const updatePricingRuleMutation = useMutation({
    mutationFn: ({ cityId, patch }) => updatePricingRule(cityId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pricingRules"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  const updateSystemSettingsMutation = useMutation({
    mutationFn: (patch) => updateAdminSettings(patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "settings"] })
  });

  const cleanupRecordsMutation = useMutation({
    mutationFn: cleanupAdminRecords,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "supportTickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "myRides"] });
    }
  });

  const queryError =
    dashboardQuery.error ||
    customersQuery.error ||
    driversQuery.error ||
    ridesQuery.error ||
    supportQuery.error ||
    pricingQuery.error ||
    settingsQuery.error ||
    null;

  const mutationError =
    updateCustomerStatusMutation.error ||
    updateDriverStatusMutation.error ||
    closeSupportTicketMutation.error ||
    updatePricingRuleMutation.error ||
    updateSystemSettingsMutation.error ||
    cleanupRecordsMutation.error ||
    null;

  return {
    dashboard: dashboardQuery.data || null,
    dashboardStats: dashboardQuery.data?.stats || null,
    customers: customersQuery.data || [],
    drivers: driversQuery.data || [],
    rides: ridesQuery.data || [],
    supportTickets: supportQuery.data || [],
    pricingRules: pricingQuery.data || [],
    settings: settingsQuery.data || null,
    isLoading:
      dashboardQuery.isLoading ||
      customersQuery.isLoading ||
      driversQuery.isLoading ||
      ridesQuery.isLoading ||
      supportQuery.isLoading ||
      pricingQuery.isLoading ||
      settingsQuery.isLoading,
    backendError: queryError,
    queryError,
    mutationError,
    updateCustomerStatusRemote: updateCustomerStatusMutation.mutateAsync,
    updateDriverStatusRemote: updateDriverStatusMutation.mutateAsync,
    closeSupportTicketRemote: closeSupportTicketMutation.mutateAsync,
    updatePricingRuleRemote: updatePricingRuleMutation.mutateAsync,
    updateSystemSettingsRemote: updateSystemSettingsMutation.mutateAsync,
    cleanupRecordsRemote: cleanupRecordsMutation.mutateAsync,
    cleanupResult: cleanupRecordsMutation.data || null,
    cleanupError: cleanupRecordsMutation.error || null,
    isMutating:
      updateCustomerStatusMutation.isPending ||
      updateDriverStatusMutation.isPending ||
      closeSupportTicketMutation.isPending ||
      updatePricingRuleMutation.isPending ||
      updateSystemSettingsMutation.isPending ||
      cleanupRecordsMutation.isPending
  };
}
