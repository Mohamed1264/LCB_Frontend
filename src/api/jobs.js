import api from "./api";

// جلب كل الأدوار الوظيفية (حسب شركة المستخدم الحالي)
export const getJobs = async () => {
  const { data } = await api.get("/jobs");
  return data;
};

// إضافة دور جديد
export const createJobRole = async (jobData) => {
  const { data } = await api.post("/jobs", jobData);
  return data;
};

// تحديث دور
export const updateJobRole = async (id, jobData) => {
  const { data } = await api.put(`/jobs/${id}`, jobData);
  return data;
};

// حذف دور
export const deleteJobRole = async (id) => {
  const { data } = await api.delete(`/jobs/${id}`);
  return data;
};