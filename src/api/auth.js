import api from "./api";

// Login
export const login = async (credentials) => {
  console.log(document.cookie);
  const { data } = await api.post("/login", credentials);
  return data;
};

// Logout
export const logout = async () => {
  const { data } = await api.post("/logout");
  return data;
};

// Get current user
export const me = async () => {
  const { data } = await api.get("/me");
  return data; 
};
