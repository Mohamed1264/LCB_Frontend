import api from "./api";

// GET all categories
export const getCategoriesByCompany = async () => {
  const { data } = await api.get("/categories");
  return data;
};

// CREATE
export const createCategory = async (categoryData) => {
  const { data } = await api.post("/category", categoryData);
  return data;
};

// UPDATE ✅ (fix هنا)
export const updateCategory = async (id, categoryData) => {
  const { data } = await api.put(`/category/${id}`, categoryData);
  return data;
};

// DELETE
export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/category/${id}`);
  return data;
};
