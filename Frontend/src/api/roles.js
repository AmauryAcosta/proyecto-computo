import api from "./axios";

export const getRoles = async () => {
  const { data } = await api.get("/roles");
  return data.items;
};
