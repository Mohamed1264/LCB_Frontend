import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductsByCompany, createProduct, updateProduct, deleteProduct } from "../api/products";

// هوك جلب البيانات
export const useProducts = (companyId) => {
  return useQuery({
    queryKey: ["products", companyId],
    queryFn: () => getProductsByCompany(companyId),
    enabled: !!companyId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

// هوك الحذف
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id }) => deleteProduct(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", variables.companyId] });
    },
  });
};

// هوك الإضافة
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// هوك التحديث
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id, data }) => updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", variables.companyId] });
    },
  });
};
