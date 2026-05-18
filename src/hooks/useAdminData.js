import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminCustomers, fetchAdminDrivers, fetchAdminRides } from "../services/adminApi.js";
import { fetchPricingRules, updatePricingRule } from "../services/pricingApi.js";
import { fetchSupportTickets, updateSupportTicketStatus } from "../services/supportApi.js";

export function useAdminData({ enabled = true } = {}) {
  const queryClient = useQueryClient();
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

  const closeSupportTicketMutation = useMutation({
    mutationFn: ({ ticketId, status = "closed" }) => updateSupportTicketStatus(ticketId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "supportTickets"] })
  });

  const updatePricingRuleMutation = useMutation({
    mutationFn: ({ cityId, patch }) => updatePricingRule(cityId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "pricingRules"] })
  });

  const backendError =
    customersQuery.error ||
    driversQuery.error ||
    ridesQuery.error ||
    supportQuery.error ||
    pricingQuery.error ||
    closeSupportTicketMutation.error ||
    updatePricingRuleMutation.error ||
    null;

  return {
    customers: customersQuery.data || [],
    drivers: driversQuery.data || [],
    rides: ridesQuery.data || [],
    supportTickets: supportQuery.data || [],
    pricingRules: pricingQuery.data || [],
    isLoading:
      customersQuery.isLoading ||
      driversQuery.isLoading ||
      ridesQuery.isLoading ||
      supportQuery.isLoading ||
      pricingQuery.isLoading,
    backendError,
    closeSupportTicketRemote: closeSupportTicketMutation.mutateAsync,
    updatePricingRuleRemote: updatePricingRuleMutation.mutateAsync,
    isMutating: closeSupportTicketMutation.isPending || updatePricingRuleMutation.isPending
  };
}
