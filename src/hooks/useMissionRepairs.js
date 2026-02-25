import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMissionRepairs,
  updateMissionRepair,
  createMissionRepair,
  deleteMissionRepair,
} from "../api/missionRepairs";

// 🔹 Hook لجلب مهام الصيانة
export const useMissionRepairs = () => {
  return useQuery({
    queryKey: ["missionRepairs"],
    queryFn: getMissionRepairs,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// 🔹 Hook للحذف
export const useDeleteMissionRepair = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteMissionRepair(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missionRepairs"] });
    },
  });
};

// 🔹 Hook للإضافة
export const useCreateMissionRepair = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createMissionRepair(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missionRepairs"] });
    },
  });
};

// 🔹 Hook للتحديث
export const useUpdateMissionRepair = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateMissionRepair(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missionRepairs"] });
    },
  });
};
