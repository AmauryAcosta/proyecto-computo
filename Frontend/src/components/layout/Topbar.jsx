import { useLocation } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";

const topbarActions = {
  "/usuarios": {
    label: "+ Nuevo Usuario",
    event: "openNewUser",
    permiso: "users:create",
  },
  "/clientes": {
    label: "+ Nuevo Cliente",
    event: "openNewClient",
    permiso: "clients:create",
  },
  "/proveedores": {
    label: "+ Nuevo Proveedor",
    event: "openNewSupplier",
    permiso: "suppliers:create",
  },
  "/productos": {
    label: "+ Nuevo Producto",
    event: "openNewProduct",
    permiso: "products:create",
  },
  "/recepciones": {
    label: "+ Nueva Recepción",
    event: "openNewRecepcion",
    permiso: "recepciones:create",
  },
};

const pageTitles = {
  "/dashboard": "Dashboard",
  "/usuarios": "Usuarios",
  "/clientes": "Clientes",
  "/proveedores": "Proveedores",
  "/productos": "Productos",
  "/inventario": "Inventario",
  "/recepciones": "Recepciones",
  "/auditoria": "Auditorías del sistema",
  "/roles": "Roles",
  "/permisos": "Permisos",
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { hasPermission } = usePermission();
  const action = topbarActions[pathname];
  const title = pageTitles[pathname] || "ByteStore";
  const puedeCrear = action && hasPermission(action.permiso);

  const handleAction = () => {
    if (action) document.dispatchEvent(new CustomEvent(action.event));
  };

  return (
    <header
      style={{
        height: "60px",
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      <h1
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#111827",
          margin: 0,
        }}
      >
        {title}
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {puedeCrear && (
          <button
            onClick={handleAction}
            style={{
              padding: "8px 16px",
              background: "#1b4332",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
}
