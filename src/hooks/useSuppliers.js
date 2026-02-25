import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuppliersByCompany,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../api/suppliers";

export const useSuppliers = (companyId) => {
  return useQuery({
    queryKey: ["suppliers", companyId],
    queryFn: () => getSuppliersByCompany(companyId),
    enabled: !!companyId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (supplierData) => createSupplier(supplierData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id, data }) => updateSupplier(companyId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.companyId] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id }) => deleteSupplier(companyId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.companyId] });
    },
  });
};
