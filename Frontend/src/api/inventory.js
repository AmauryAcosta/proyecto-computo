import api from "./axios";

export const getInventory = async (page = 1, limit = 10) => {
  const { data } = await api.get("/inventory", { params: { page, limit } });
  return data;
};

export const getInventoryByProduct = async (productId) => {
  const { data } = await api.get(`/inventory/${productId}`);
  return data.item;
};

export const adjustInventory = async (productId, adjustData) => {
  const { data } = await api.patch(`/inventory/${productId}/adjust`, adjustData);
  return data.item;
};

export const getInventoryMovements = async (page = 1, limit = 10) => {
  const { data } = await api.get("/inventory/movements", {
    params: { page, limit },
  });
  return data;
};