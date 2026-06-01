import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import AppLayout from "./components/layout/AppLayout";
import ErrorBoundary from "./components/errors/ErrorBoundary";
import Login from "./pages/Login";
import Proveedores from "./pages/proveedores/Proveedores";
import UserList from "./pages/users/UserList";
import ClientList from "./pages/clients/ClientList";
import Recepciones from "./pages/recepciones/Recepciones";
import InventoryList from "./pages/inventory/InventoryList";
import NotFound from "./pages/errors/NotFound";
import Unauthorized from "./pages/errors/Unauthorized";
import Forbidden from "./pages/errors/Forbidden";
import ProductList from "./pages/products/ProductsList";
import AuditList from "./pages/audit/AuditList";
import Dashboard from "./pages/Dashboard";
import PermissionRoute from "./routes/PermissionRoute";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Páginas de error — accesibles sin autenticación */}
          <Route path="/401" element={<Unauthorized />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/404" element={<NotFound />} />

          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route element={<PermissionRoute permiso="users:read" />}>
                <Route path="/usuarios" element={<UserList />} />
              </Route>

              <Route element={<PermissionRoute permiso="clients:read" />}>
                <Route path="/clientes" element={<ClientList />} />
              </Route>

              <Route element={<PermissionRoute permiso="suppliers:read" />}>
                <Route path="/proveedores" element={<Proveedores />} />
              </Route>

              <Route element={<PermissionRoute permiso="products:read" />}>
                <Route path="/productos" element={<ProductList />} />
              </Route>

              <Route element={<PermissionRoute permiso="inventory:read" />}>
                <Route path="/inventario" element={<InventoryList />} />
              </Route>

              <Route element={<PermissionRoute permiso="recepciones:read" />}>
                <Route path="/recepciones" element={<Recepciones />} />
              </Route>

              <Route element={<PermissionRoute permiso="audit:read" />}>
                <Route path="/auditoria" element={<AuditList />} />
              </Route>
            </Route>
          </Route>

          {/* Cualquier ruta no encontrada → 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
