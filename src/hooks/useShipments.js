import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShipmentsByCompany,
  createShipment,
  updateShipment,
  deleteShipment,
} from "../api/shipments";

export const useShipments = (companyId) => {
  return useQuery({
    queryKey: ["shipments", companyId],
    queryFn: () => getShipmentsByCompany(companyId),
    enabled: !!companyId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useCreateShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentData) => createShipment(shipmentData),
    onSuccess: (_, variables) => {
      // We need companyId from the response or variables
      // For now, invalidate all shipments queries
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
};

export const useUpdateShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id, data }) => updateShipment(companyId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments", variables.companyId] });
    },
  });
};

export const useDeleteShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, id }) => deleteShipment(companyId, id),
    onSuccess: (_, variables) => {
      // Invalidate shipments query
      queryClient.invalidateQueries({ queryKey: ["shipments", variables.companyId] });
      // Also invalidate products query since related products are deleted
      queryClient.invalidateQueries({ queryKey: ["products", variables.companyId] });
    },
  });
};
