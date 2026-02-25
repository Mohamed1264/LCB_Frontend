import api from "./api";

export const getJobTask = async () => {
  const { data } = await api.get("/jobTasks");
  return data;
};

export const createJobTask = async (TaskData) => {
  const { data } = await api.post("/addJobTasks", TaskData);
  return data;
};

export const updateJobTask = async (id, TaskData) => {
  const { data } = await api.put(`/updateJobTasks/${id}`, TaskData);
  return data;
};

// حذف دور
export const deleteJobtask = async (id) => {
  const { data } = await api.delete(`/deleteJobTasks/${id}`);
  return data;
};