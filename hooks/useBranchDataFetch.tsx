import { DataContext } from "@/Context/DataContext";
import { getBranch, getBranchData } from "@/lib/fetch/Branch";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";

export const useBranchDataFetch = (_id) => {
  const { setBranchData } = useContext(DataContext);

  return useQuery({
    gcTime: 24 * 24 *60 * 60 * 1000,
    queryKey: ["dashboardData", _id],
    retry: 10,
    queryFn: async () => {
      const result = await getBranchData(_id);
      if (result) {
        console.log("🚀 ~ queryFn ~ branchData:", result);
        setBranchData(result);
      }
      return result || null;
    },
    enabled: !!_id,
  });
};
