import api from "./axios";

export const getSuppliers = async (page = 1, limit = 10) => {
  const { data } = await api.get("/suppliers", { params: { page, limit } });
  return data;
};

export const createSupplier = async (supplierData) => {
  const { data } = await api.post("/suppliers", supplierData);
  return data.item;
};

export const updateSupplier = async (id, supplierData) => {
  const { data } = await api.patch(`/suppliers/${id}`, supplierData);
  return data.item;
};

export const toggleSupplier = async (id) => {
  const { data } = await api.patch(`/suppliers/${id}/toggle-active`);
  return data.item;
};

export const deleteSupplier = async (id) => {
  const { data } = await api.delete(`/suppliers/${id}`);
  return data;
};
