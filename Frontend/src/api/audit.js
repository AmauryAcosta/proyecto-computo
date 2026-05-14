import api from "./axios";

export const getAudit = async (page = 1, limit = 10) => {
  const { data } = await api.get("/audit", { params: { page, limit } });
  return data;
};

export const getAuditById = async (id) => {
  const { data } = await api.get(`/audit/${id}`);
  return data.item;
};
