import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveCaptainApplication,
  createCaptainApplication,
  fetchCaptainApplications,
  rejectCaptainApplication
} from "../services/captainApplicationsApi.js";

export const CAPTAIN_APPLICATIONS_QUERY_KEY = ["admin", "captainApplications"];

export function useCaptainApplications({ enabled = true } = {}) {
  const queryClient = useQueryClient();
  const applicationsQuery = useQuery({
    queryKey: CAPTAIN_APPLICATIONS_QUERY_KEY,
    queryFn: fetchCaptainApplications,
    enabled,
    staleTime: 10_000
  });

  const createMutation = useMutation({
    mutationFn: createCaptainApplication,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CAPTAIN_APPLICATIONS_QUERY_KEY })
  });

  const approveMutation = useMutation({
    mutationFn: approveCaptainApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAPTAIN_APPLICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectCaptainApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAPTAIN_APPLICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    }
  });

  const queryError = applicationsQuery.error || null;
  const mutationError =
    createMutation.error ||
    approveMutation.error ||
    rejectMutation.error ||
    null;

  return {
    applications: applicationsQuery.data || [],
    isLoading: applicationsQuery.isLoading,
    isFetching: applicationsQuery.isFetching,
    backendError: queryError,
    queryError,
    mutationError,
    createApplication: createMutation.mutateAsync,
    approveApplication: approveMutation.mutateAsync,
    rejectApplication: rejectMutation.mutateAsync,
    isMutating: createMutation.isPending || approveMutation.isPending || rejectMutation.isPending,
    refetch: applicationsQuery.refetch
  };
}
