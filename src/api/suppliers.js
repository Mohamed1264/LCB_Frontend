import api from "./api";

// جلب كل الموردين للشركة
export const getSuppliersByCompany = async () => {
  const { data } = await api.get(`/supliers`);
  return data;
};

// إضافة مورد جديد
export const createSupplier = async (supplierData) => {
  const { data } = await api.post("/suplier", supplierData);
  return data;
};

// تحديث مورد
export const updateSupplier = async ( id, supplierData) => {
  const { data } = await api.put(`/suplier/${id}`, supplierData);
  return data;
};

// حذف مورد
export const deleteSupplier = async ( id) => {
  const { data } = await api.delete(`/suplier/${id}`);
  return data;
};
