import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptDriverRide,
  fetchAvailableDriverRides,
  fetchDriverRides,
  updateDriverOnlineStatus,
  updateDriverRideStatus
} from "../services/driverApi.js";

export function useDriverData({ enabled = true, driverId = "", phone = "", cityId = "" } = {}) {
  const queryClient = useQueryClient();
  const availableRidesQuery = useQuery({
    queryKey: ["driver", "availableRides", cityId],
    queryFn: () => fetchAvailableDriverRides({ cityId }),
    enabled,
    staleTime: 8_000
  });

  const driverRidesQuery = useQuery({
    queryKey: ["driver", "myRides", driverId || phone],
    queryFn: () => fetchDriverRides({ driverId, phone }),
    enabled: enabled && Boolean(driverId || phone),
    staleTime: 8_000
  });

  function invalidateRideQueries() {
    queryClient.invalidateQueries({ queryKey: ["driver", "availableRides"] });
    queryClient.invalidateQueries({ queryKey: ["driver", "myRides"] });
    queryClient.invalidateQueries({ queryKey: ["rides"] });
    queryClient.invalidateQueries({ queryKey: ["customer", "rides"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "rides"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  }

  const acceptRideMutation = useMutation({
    mutationFn: acceptDriverRide,
    onSuccess: invalidateRideQueries
  });

  const updateRideStatusMutation = useMutation({
    mutationFn: updateDriverRideStatus,
    onSuccess: invalidateRideQueries
  });

  const updateOnlineStatusMutation = useMutation({
    mutationFn: updateDriverOnlineStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] })
  });

  const queryError =
    availableRidesQuery.error ||
    driverRidesQuery.error ||
    null;

  const mutationError =
    acceptRideMutation.error ||
    updateRideStatusMutation.error ||
    updateOnlineStatusMutation.error ||
    null;

  const backendError = queryError || mutationError;

  return {
    availableRides: availableRidesQuery.data || [],
    myRides: driverRidesQuery.data || [],
    isLoading: availableRidesQuery.isLoading || driverRidesQuery.isLoading,
    isAvailableLoading: availableRidesQuery.isLoading,
    isMyRidesLoading: driverRidesQuery.isLoading,
    backendError,
    queryError,
    mutationError,
    refetchAvailableRides: availableRidesQuery.refetch,
    refetchMyRides: driverRidesQuery.refetch,
    acceptRide: acceptRideMutation.mutateAsync,
    updateRideStatus: updateRideStatusMutation.mutateAsync,
    updateOnlineStatus: updateOnlineStatusMutation.mutateAsync,
    isMutating:
      acceptRideMutation.isPending ||
      updateRideStatusMutation.isPending ||
      updateOnlineStatusMutation.isPending
  };
}
