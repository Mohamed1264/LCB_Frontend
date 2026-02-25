import api from "./api";

// جلب كل الصلاحيات النظامية
export const getSystemPermissions = async () => {
  const { data } = await api.get(`/system-permissions`);
  return data;
};
