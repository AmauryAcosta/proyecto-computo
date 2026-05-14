import api from "./axios";

export const getProducts = async (page = 1, limit = 10) => {
  const { data } = await api.get("/products", { params: { page, limit } });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.item;
};

export const createProduct = async (productData) => {
  const { data } = await api.post("/products", productData);
  return data.item;
};

export const updateProduct = async (id, productData) => {
  const { data } = await api.patch(`/products/${id}`, productData);
  return data.item;
};

export const toggleProduct = async (id) => {
  const { data } = await api.patch(`/products/${id}/toggle-active`);
  return data.item;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
