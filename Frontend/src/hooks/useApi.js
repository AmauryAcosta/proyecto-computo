import { useState, useCallback } from "react";
import axios from "axios";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async ({ method = "GET", url, data = null, params = null }) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios({
        method,
        url: `http://localhost:3001${url}`,
        data,
        params,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      const mensaje = err.response?.data?.message || "Error en la solicitud";
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
}