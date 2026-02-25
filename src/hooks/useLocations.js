import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLocations, createLocation, updateLocation, deleteLocation } from "../api/locations";

// 🔹 Hook لجلب المواقع
export const useLocations = () => {
  return useQuery({
    queryKey: ["locations"], // لم نعد بحاجة companyId
    queryFn: getLocations,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// 🔹 Hook للحذف
export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

// 🔹 Hook للإضافة
export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

// 🔹 Hook للتحديث
export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};