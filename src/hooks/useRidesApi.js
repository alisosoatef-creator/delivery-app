import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptRide,
  cancelRide,
  createRide,
  fetchCustomerRides,
  fetchRides,
  patchRideStatus,
  requestRideQuote
} from "../services/ridesApi.js";

export function useRidesApi({ enabled = true, customerId = "", customerPhone = "" } = {}) {
  const queryClient = useQueryClient();
  const ridesQuery = useQuery({
    queryKey: ["rides"],
    queryFn: fetchRides,
    enabled,
    staleTime: 10_000
  });
  const customerRidesQuery = useQuery({
    queryKey: ["customer", "rides", customerId || customerPhone],
    queryFn: () => fetchCustomerRides({ customerId, customerPhone }),
    enabled: enabled && Boolean(customerId || customerPhone),
    staleTime: 10_000
  });

  const quoteMutation = useMutation({ mutationFn: requestRideQuote });
  const createRideMutation = useMutation({
    mutationFn: createRide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });
  const statusMutation = useMutation({
    mutationFn: ({ rideId, status }) => patchRideStatus(rideId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });
  const cancelRideMutation = useMutation({
    mutationFn: (rideId) => cancelRide(rideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });
  const acceptRideMutation = useMutation({
    mutationFn: ({ rideId, driverId }) => acceptRide(rideId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  const queryError =
    ridesQuery.error ||
    customerRidesQuery.error ||
    null;

  const mutationError =
    quoteMutation.error ||
    createRideMutation.error ||
    statusMutation.error ||
    cancelRideMutation.error ||
    acceptRideMutation.error ||
    null;

  return {
    rides: ridesQuery.data || [],
    customerRides: customerRidesQuery.data || [],
    customerRidesLoaded: customerRidesQuery.isSuccess,
    backendError: queryError,
    queryError,
    mutationError,
    requestQuote: quoteMutation.mutateAsync,
    createRide: createRideMutation.mutateAsync,
    updateRideStatus: statusMutation.mutateAsync,
    cancelRide: cancelRideMutation.mutateAsync,
    acceptRide: acceptRideMutation.mutateAsync,
    isLoading: ridesQuery.isLoading,
    isCustomerRidesLoading: customerRidesQuery.isLoading,
    isMutating:
      quoteMutation.isPending ||
      createRideMutation.isPending ||
      statusMutation.isPending ||
      cancelRideMutation.isPending ||
      acceptRideMutation.isPending
  };
}
