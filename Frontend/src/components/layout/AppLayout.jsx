import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/usuarios": "Usuarios",
  "/clientes": "Clientes",
  "/proveedores": "Proveedores",
  "/productos": "Productos",
  "/inventario": "Inventario",
  "/recepciones": "Recepciones",
  "/auditoria": "Auditorías del sistema",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || "ByteStore";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Topbar title={title} />
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
