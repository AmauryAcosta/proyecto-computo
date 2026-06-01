import { Navigate, Outlet } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";

export default function PermissionRoute({ permiso }) {
  const { hasPermission } = usePermission();

  const tiene = hasPermission(permiso);
  console.log(`Permiso ${permiso}:`, tiene);

  return tiene ? <Outlet /> : <Navigate to="/403" replace />;
}
