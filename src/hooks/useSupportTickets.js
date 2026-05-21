import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupportTicket, fetchMySupportTickets, updateSupportTicketStatus } from "../services/supportApi.js";

export function useSupportTickets({ enabled = true, phone = "", role = "customer" } = {}) {
  const queryClient = useQueryClient();
  const ticketsQuery = useQuery({
    queryKey: ["support", "myTickets", role, phone],
    queryFn: () => fetchMySupportTickets({ phone, role }),
    enabled: enabled && Boolean(phone),
    staleTime: 10_000
  });

  const createTicketMutation = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "myTickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "supportTickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }) => updateSupportTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "myTickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "supportTickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  return {
    tickets: ticketsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    isError: ticketsQuery.isError,
    backendError: ticketsQuery.error || null,
    queryError: ticketsQuery.error || null,
    mutationError: createTicketMutation.error || updateTicketStatusMutation.error || null,
    refetchTickets: ticketsQuery.refetch,
    createTicket: createTicketMutation.mutateAsync,
    updateTicketStatus: updateTicketStatusMutation.mutateAsync,
    isCreating: createTicketMutation.isPending,
    isMutating: createTicketMutation.isPending || updateTicketStatusMutation.isPending
  };
}
