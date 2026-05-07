import api from "./axios";

export const getUsers = async (page = 1, limit = 10) => {
  const { data } = await api.get("/users", { params: { page, limit } });
  return data; 
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data.item;
};

export const createUser = async (userData) => {
  const { data } = await api.post("/users", userData);
  return data.item;
};

export const updateUser = async (id, userData) => {
  const { data } = await api.patch(`/users/${id}`, userData);
  return data.item;
};

export const toggleUser = async (id) => {
  const { data } = await api.patch(`/users/${id}/toggle-active`);
  return data.item;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};