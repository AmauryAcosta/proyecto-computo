import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/users/UserList";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<UserList />} />
            <Route path="/clientes" element={<div>Clientes</div>} />
            <Route path="/proveedores" element={<div>Proveedores</div>} />
            <Route path="/productos" element={<div>Productos</div>} />
            <Route path="/inventario" element={<div>Inventario</div>} />
            <Route path="/recepciones" element={<div>Recepciones</div>} />
            <Route path="/auditoria" element={<div>Auditoría</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
