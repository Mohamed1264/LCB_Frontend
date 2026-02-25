import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployeesByCompany,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employees";

export const useEmployees = (companyId) => {
  return useQuery({
    queryKey: ["employees", companyId],
    queryFn: () => getEmployeesByCompany(companyId),
    enabled: !!companyId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeData) => createEmployee(employeeData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id, data }) => updateEmployee(companyId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees", variables.companyId] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id }) => deleteEmployee(companyId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees", variables.companyId] });
    },
  });
};
