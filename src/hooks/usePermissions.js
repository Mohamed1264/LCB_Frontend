import { useQuery } from "@tanstack/react-query";
import { getSystemPermissions } from "../api/permissions";

export const usePermissions = () => {
  return useQuery({
    queryKey: ["system-permissions"],
    queryFn: getSystemPermissions,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};