import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import AppLayout from "./components/layout/AppLayout";
import ErrorBoundary from "./components/errors/ErrorBoundary";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Proveedores from "./pages/proveedores/Proveedores";
import UserList from "./pages/users/UserList";
import ClientList from "./pages/clients/ClientList";
import Recepciones from "./pages/recepciones/Recepciones";
import InventoryList from "./pages/inventory/InventoryList";
import NotFound from "./pages/errors/NotFound";
import Unauthorized from "./pages/errors/Unauthorized";
import Forbidden from "./pages/errors/Forbidden";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Páginas de error — accesibles sin autenticación */}
          <Route path="/401" element={<Unauthorized />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/404" element={<NotFound />} />

          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/usuarios" element={<UserList />} />
              <Route path="/clientes" element={<ClientList />} />
              <Route path="/proveedores" element={<Proveedores />} />
              <Route path="/productos" element={<div>Productos</div>} />
              <Route
                path="/inventario"
                element={
                  <div>
                    <InventoryList />
                  </div>
                }
              />
              <Route
                path="/recepciones"
                element={
                  <div>
                    <Recepciones />
                  </div>
                }
              />
              <Route path="/auditoria" element={<div>Auditoría</div>} />
            </Route>
          </Route>

          {/* Cualquier ruta no encontrada → 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}