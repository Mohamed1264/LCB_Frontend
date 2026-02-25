import api from "./api";

// جلب كل حركات المخزن للشركة
export const getStockMovementsByCompany = async () => {
  const { data } = await api.get(`/stock-movements`);
  return data;
};

// إضافة حركة مخزن جديدة
export const createStockMovement = async (movementData) => {
  const { data } = await api.post(`/stock-movements`, movementData);
  return data;
};

// تحديث حركة مخزن
export const updateStockMovement = async (id, movementData) => {
  const { data } = await api.put(`/stock-movements/${id}`, movementData);
  return data;
};

// حذف حركة مخزن
export const deleteStockMovement = async (id) => {
  const { data } = await api.delete(`/stock-movements/${id}`);
  return data;
};

// جلب حركة مخزن واحدة
export const getStockMovement = async (id) => {
  const { data } = await api.get(`/stock-movements/${id}`);
  return data;
};