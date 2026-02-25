import api from "./api";

// جلب كل الموظفين للشركة
export const getEmployeesByCompany = async (companyId) => {
  const { data } = await api.get(`/employees`);
  return data;
};

// إضافة موظف جديد
export const createEmployee = async (employeeData) => {
  const { data } = await api.post("/employee", employeeData);
  return data;
};

// تحديث موظف
export const updateEmployee = async (companyId, id, employeeData) => {
  const { data } = await api.put(`/employee/${id}`, employeeData);
  return data;
};

// حذف موظف
export const deleteEmployee = async (companyId, id) => {
  const { data } = await api.delete(`/employee/${id}`);
  return data;
};
