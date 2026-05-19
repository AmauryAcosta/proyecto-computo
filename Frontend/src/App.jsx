import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Proveedores from "./pages/proveedores/Proveedores";
import UserList from "./pages/users/UserList";
import ClientList from "./pages/clients/ClientList";
import Recepciones from "./pages/recepciones/Recepciones";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<UserList />} />
            <Route path="/clientes" element={<ClientList />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/productos" element={<div>Productos</div>} />
            <Route path="/inventario" element={<div>Inventario</div>} />
            <Route path="/recepciones" element={<Recepciones />} />
            <Route path="/auditoria" element={<div>Auditoría</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
