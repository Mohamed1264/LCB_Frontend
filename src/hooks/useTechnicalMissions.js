import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTechnicalMissions,
  updateTechnicalMission,
  createTechnicalMission,
  deleteTechnicalMission,
} from "../api/technicalMissions";

// 🔹 Hook لجلب المهام التقنية
export const useTechnicalMissions = () => {
  return useQuery({
    queryKey: ["technicalMissions"],
    queryFn: getTechnicalMissions,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// 🔹 Hook للحذف
export const useDeleteTechnicalMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTechnicalMission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicalMissions"] });
    },
  });
};

// 🔹 Hook للإضافة
export const useCreateTechnicalMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createTechnicalMission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicalMissions"] });
    },
  });
};

// 🔹 Hook للتحديث
export const useUpdateTechnicalMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTechnicalMission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicalMissions"] });
    },
  });
};
