import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, createJobRole, updateJobRole, deleteJobRole } from "../api/jobs";

// 🔹 Hook لجلب الوظائف
export const useJobs = () => {
  return useQuery({
    queryKey: ["jobs"], // لم نعد بحاجة companyId
    queryFn: getJobs,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// 🔹 Hook للحذف
export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteJobRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

// 🔹 Hook للإضافة
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createJobRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

// 🔹 Hook للتحديث
export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateJobRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};