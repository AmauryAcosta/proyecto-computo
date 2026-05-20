import api from "./axios";

export const getRecepciones = async (page = 1, limit = 10) => {
  const { data } = await api.get("/recepciones", { params: { page, limit } });
  return data;
};

export const getRecepcionById = async (id) => {
  const { data } = await api.get(`/recepciones/${id}`);
  return data.item;
};

export const createRecepcion = async (recepcionData) => {
  const { data } = await api.post("/recepciones", recepcionData);
  return data.item;
};

export const updateRecepcion = async (id, recepcionData) => {
  const { data } = await api.patch(`/recepciones/${id}`, recepcionData);
  return data.item;
};

export const confirmRecepcion = async (id) => {
  const { data } = await api.post(`/recepciones/${id}/confirm`);
  return data.item;
};

export const deleteRecepcion = async (id) => {
  const { data } = await api.delete(`/recepciones/${id}`);
  return data;
};