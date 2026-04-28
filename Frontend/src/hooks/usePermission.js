import { useCallback } from "react";

export function usePermission() {
  const hasPermission = useCallback((permiso) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const permisos = payload.permissions || [];
      return permisos.includes(permiso);
    } catch {
      return false;
    }
  }, []);

  const hasRole = useCallback((rol) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role === rol;
    } catch {
      return false;
    }
  }, []);

  return { hasPermission, hasRole };
}