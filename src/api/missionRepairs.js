import api from "./api";

// جلب كل المهام الصيانة
export const getMissionRepairs = async () => {
  const { data } = await api.get("/mission-repairs");
  return data;
};

// إضافة مهمة صيانة جديدة
export const createMissionRepair = async (repairData) => {
  const { data } = await api.post("/mission-repair", repairData);
  return data;
};

// تحديث مهمة صيانة موجودة
export const updateMissionRepair = async (id, repairData) => {
  const { data } = await api.put(`/mission-repair/${id}`, repairData);
  return data;
};

// حذف مهمة صيانة
export const deleteMissionRepair = async (id) => {
  const { data } = await api.delete(`/mission-repair/${id}`);
  return data;
};
