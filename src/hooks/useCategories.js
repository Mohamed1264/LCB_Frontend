import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategoriesByCompany,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";

// GET
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesByCompany,
  });
};

// CREATE
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// UPDATE ✅ (fix هنا)
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// DELETE
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => deleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
