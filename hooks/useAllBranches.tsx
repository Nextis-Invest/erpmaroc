import { getAllBranches } from "@/lib/fetch/Branch";
import { useQuery } from "@tanstack/react-query";

export const useAllBranches = (region?: string, city?: string, manager?: string) => {
  return useQuery({
    queryKey: ["allBranches", region, city, manager],
    queryFn: () => getAllBranches(region, city, manager),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};