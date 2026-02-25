import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStockMovementsByCompany,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  getStockMovement
} from "../api/stockMovements";

// هوك جلب البيانات
export const useStockMovements = (companyId) => {
  return useQuery({
    queryKey: ["stockMovements", companyId],
    queryFn: () => getStockMovementsByCompany(companyId),
    enabled: !!companyId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// هوك جلب حركة واحدة
export const useStockMovement = (id) => {
  return useQuery({
    queryKey: ["stockMovement", id],
    queryFn: () => getStockMovement(id),
    enabled: !!id,
    staleTime: 0,
  });
};

// هوك الحذف
export const useDeleteStockMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id }) => deleteStockMovement(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stockMovements", variables.companyId] });
    },
  });
};

// هوك الإضافة
export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createStockMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockMovements"] });
    },
  });
};

// هوك التحديث
export const useUpdateStockMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id, data }) => updateStockMovement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stockMovements", variables.companyId] });
    },
  });
};