import api from "./axios";

export const loginRequest = async (usuario, password) => {
  const { data } = await api.post("/auth/login", { usuario, password });
  return data;
};

export const getMeRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
