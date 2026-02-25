import api from "./api";

// جلب كل المواقع (Locations) حسب صلاحيات المستخدم
export const getLocations = async () => {
  const { data } = await api.get("/locations");
  return data;
};

// إضافة موقع جديد
export const createLocation = async (locationData) => {
  const { data } = await api.post("/location", locationData);
  return data;
};

// تحديث موقع موجود
export const updateLocation = async (id, locationData) => {
  const { data } = await api.put(`/location/${id}`, locationData);
  return data;
};

// حذف موقع
export const deleteLocation = async (id) => {
  const { data } = await api.delete(`/location/${id}`);
  return data;
};