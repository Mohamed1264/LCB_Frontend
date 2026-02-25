import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/dashboard";

// هوك جلب إحصائيات لوحة التحكم
export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};