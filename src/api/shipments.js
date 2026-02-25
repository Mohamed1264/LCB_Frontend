import api from "./api";

// جلب كل الشحنات للشركة
export const getShipmentsByCompany = async () => {
  const { data } = await api.get(`/shipments`);
  return data;
};

// إضافة شحنة جديدة
export const createShipment = async (shipmentData) => {
  const formData = new FormData();
  formData.append("reference", shipmentData.reference);
  formData.append("date", shipmentData.date);
  formData.append("total_cost", shipmentData.total_cost);
  formData.append("supplier_id", shipmentData.supplier_id);
  formData.append("created_by", shipmentData.created_by);
  if (shipmentData.bon_image) {
    formData.append("bon_image", shipmentData.bon_image);
  }

  const { data } = await api.post("/shipment", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// تحديث شحنة
export const updateShipment = async ( id, shipmentData) => {
  const formData = new FormData();
  if (shipmentData.reference) formData.append("reference", shipmentData.reference);
  if (shipmentData.date) formData.append("date", shipmentData.date);
  if (shipmentData.total_cost) formData.append("total_cost", shipmentData.total_cost);
  if (shipmentData.supplier_id) formData.append("supplier_id", shipmentData.supplier_id);
  if (shipmentData.created_by) formData.append("created_by", shipmentData.created_by);
  if (shipmentData.bon_image) {
    formData.append("bon_image", shipmentData.bon_image);
  }

  const { data } = await api.put(`/shipment/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// حذف شحنة
export const deleteShipment = async ( id) => {
  const { data } = await api.delete(`/shipment/${id}`);
  return data;
};
