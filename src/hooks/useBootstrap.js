import { useQuery } from "@tanstack/react-query";
import { fetchBootstrap } from "../services/bootstrapApi.js";

export function useBootstrap() {
  return useQuery({
    queryKey: ["bootstrap"],
    queryFn: fetchBootstrap,
    retry: 1,
    staleTime: 30_000
  });
}
