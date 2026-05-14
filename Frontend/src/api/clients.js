import api from "./axios";

export const getClients = async (page = 1, limit = 10) => {
  const { data } = await api.get("/clients", { params: { page, limit } });
  return data;
};

export const getClientById = async (id) => {
  const { data } = await api.get(`/clients/${id}`);
  return data.item;
};

export const createClient = async (clientData) => {
  const { data } = await api.post("/clients", clientData);
  return data.item;
};

export const updateClient = async (id, clientData) => {
  const { data } = await api.patch(`/clients/${id}`, clientData);
  return data.item;
};

export const toggleClient = async (id) => {
  const { data } = await api.patch(`/clients/${id}/toggle-active`);
  return data.item;
};

export const deleteClient = async (id) => {
  const { data } = await api.delete(`/clients/${id}`);
  return data;
};
