import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobTask, updateJobTask, createJobTask, deleteJobtask } from "../api/jobtask";

// 🔹 Hook لجلب الوظائف
export const useJobTasks = () => {
  return useQuery({
    queryKey: ["jobsTask"], // لم نعد بحاجة companyId
    queryFn: getJobTask,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// 🔹 Hook للحذف
export const useDeleteJobTask = () => { 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteJobtask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobsTask"] });
    },
  });
};

// 🔹 Hook للإضافة
export const useCreateJobTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createJobTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobsTask"] });
    },
  });
};

// 🔹 Hook للتحديث
export const useUpdateJobTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateJobTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobsTask"] });
    },
  });
};