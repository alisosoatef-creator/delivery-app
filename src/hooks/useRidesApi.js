import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRide, fetchRides, patchRideStatus, requestRideQuote } from "../services/ridesApi.js";

export function useRidesApi({ enabled = true } = {}) {
  const queryClient = useQueryClient();
  const ridesQuery = useQuery({
    queryKey: ["rides"],
    queryFn: fetchRides,
    enabled,
    staleTime: 10_000
  });

  const quoteMutation = useMutation({ mutationFn: requestRideQuote });
  const createRideMutation = useMutation({
    mutationFn: createRide,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rides"] })
  });
  const statusMutation = useMutation({
    mutationFn: ({ rideId, status }) => patchRideStatus(rideId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rides"] })
  });

  const backendError = ridesQuery.error || quoteMutation.error || createRideMutation.error || statusMutation.error || null;

  return {
    rides: ridesQuery.data || [],
    backendError,
    requestQuote: quoteMutation.mutateAsync,
    createRide: createRideMutation.mutateAsync,
    updateRideStatus: statusMutation.mutateAsync,
    isLoading: ridesQuery.isLoading,
    isMutating: quoteMutation.isPending || createRideMutation.isPending || statusMutation.isPending
  };
}
