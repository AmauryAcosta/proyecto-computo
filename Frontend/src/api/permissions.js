import api from "./axios";

export const getPermissions = async () => {
  const { data } = await api.get("/permissions");
  return data.items;
};

export const createPermission = async (permissionData) => {
  const { data } = await api.post("/permissions", permissionData);
  return data.item;
};

export const updatePermission = async (id, permissionData) => {
  const { data } = await api.patch(`/permissions/${id}`, permissionData);
  return data.item;
};

export const deletePermission = async (id) => {
  const { data } = await api.delete(`/permissions/${id}`);
  return data;
};

export const seedPermissions = async () => {
  const { data } = await api.post("/permissions/seed");
  return data;
};
