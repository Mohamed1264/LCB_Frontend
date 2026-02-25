import api from "./api";

// جلب كل المهام التقنية
export const getTechnicalMissions = async () => {
  const { data } = await api.get("/technical-missions");
  return data;
};

// إضافة مهمة تقنية جديدة
export const createTechnicalMission = async (missionData) => {
  const { data } = await api.post("/technical-mission", missionData);
  return data;
};

// تحديث مهمة تقنية موجودة
export const updateTechnicalMission = async (id, missionData) => {
  const { data } = await api.put(`/technical-mission/${id}`, missionData);
  return data;
};

// حذف مهمة تقنية
export const deleteTechnicalMission = async (id) => {
  const { data } = await api.delete(`/technical-mission/${id}`);
  return data;
};
